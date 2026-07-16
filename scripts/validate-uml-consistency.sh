#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
UML_DIR="${ROOT_DIR}/docs/uml"
errors=0

report_error() {
  echo "LỖI: $*" >&2
  errors=$((errors + 1))
}

class_count=$(find "${UML_DIR}" -maxdepth 1 -name '*-class.puml' ! -name 'thong-bao-class.puml' ! -name 'tong-quan-dashboard-class.puml' | wc -l | tr -d ' ')
sequence_count=$(find "${UML_DIR}" -maxdepth 1 -name '*-sequence.puml' ! -name 'thong-bao-sequence.puml' ! -name 'tong-quan-dashboard-sequence.puml' | wc -l | tr -d ' ')
[[ "${class_count}" == "31" ]] || report_error "Cần 31 class diagram, hiện có ${class_count}."
[[ "${sequence_count}" == "31" ]] || report_error "Cần 31 sequence diagram, hiện có ${sequence_count}."

while IFS= read -r class_file; do
  base="${class_file%-class.puml}"
  sequence_file="${base}-sequence.puml"
  [[ -f "${sequence_file}" ]] || { report_error "Thiếu $(basename "${sequence_file}")."; continue; }

  screen_attributes=$(awk '
    /class MH[A-Za-z0-9_]* / { inside=1; next }
    inside && /^  }/ { print count + 0; exit }
    inside && /^[[:space:]]*- [A-Za-z]/ { count++ }
  ' "${class_file}")
  [[ "${screen_attributes:-0}" -ge 3 ]] || report_error "$(basename "${class_file}") có quá ít thuộc tính màn hình."

  if ! pair_output=$(env -u LC_ALL -u LC_CTYPE LC_ALL=C perl - "${class_file}" "${sequence_file}" <<'PERL'
use strict;
use warnings;

my ($class_file, $sequence_file) = @ARGV;
my (%classes, %methods, %public_methods, %aliases, %kind, %used);
my @errors;

open my $class_fh, '<', $class_file or die $!;
my $current_class;
while (my $line = <$class_fh>) {
    if ($line =~ /^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)\b/) {
        $current_class = $1;
        $classes{$current_class} = 1;
        next;
    }
    if (defined $current_class && $line =~ /^\s*([+~-])\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/) {
        $methods{$current_class}{$2} = 1;
        $public_methods{$current_class}{$2} = 1 if $1 eq '+';
        next;
    }
    undef $current_class if defined $current_class && $line =~ /^\s*}/;
}
close $class_fh;

open my $sequence_fh, '<', $sequence_file or die $!;
my @sequence_lines = <$sequence_fh>;
close $sequence_fh;

for my $line (@sequence_lines) {
    if ($line =~ /^\s*(boundary|control|entity)\s+"[^\"]*:\s*([A-Za-z_][A-Za-z0-9_]*)"\s+as\s+([A-Za-z_][A-Za-z0-9_]*)/) {
        ($kind{$3}, $aliases{$3}) = ($1, $2);
    } elsif ($line =~ /^\s*(boundary|control|entity)\s+"\s*([A-Za-z_][A-Za-z0-9_]*)"\s+as\s+([A-Za-z_][A-Za-z0-9_]*)/) {
        ($kind{$3}, $aliases{$3}) = ($1, $2);
    } elsif ($line =~ /^\s*(boundary|control|entity)\s+([A-Za-z_][A-Za-z0-9_]*)\s*$/) {
        ($kind{$2}, $aliases{$2}) = ($1, $2);
    }
}

for my $alias (sort keys %aliases) {
    push @errors, "lifeline $alias ánh xạ tới $aliases{$alias} nhưng class không tồn tại"
        unless $classes{$aliases{$alias}};
}

my %allowed_business_self_call = map { $_ => 1 } qw(
    BienBanGiaoNhan.KiemTraDuLieuTaiSan
    ChinhSachHoanCoc.KiemTraDuLieuHopLe
    HopDong.KiemTraDangHieuLuc
    HopDong.KiemTraChoThanhToan
    LapPhieuCoc.KiemTraThongTinKhachHang
    LapPhieuDoiSoat.LayChiTietVaTinhToanInternal
    LichHen.KiemTraCoTheLapPhieuCoc
    PhieuCoc.KiemTraCoTheTinhTien
    PhieuCoc.KiemTraCoTheXetDuyet
    PhieuCoc.TinhTienDuKien
    PhieuDangKy.KiemTraDieuKien
    PhieuDoiSoat.KiemTraCongNo
    Phong.GiaiPhongDatCoc
    Phong.GiuGiuong
    Phong.GiuNguyenPhong
    Phong.KiemTraGioiTinhChoPhep
);

for my $line (@sequence_lines) {
    next unless $line =~ /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*-+>\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(?:[0-9]+(?:\.[0-9]+)*\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\(/;
    my ($sender, $receiver, $method) = ($1, $2, $3);
    next unless exists $aliases{$receiver};

    my $receiver_class = $aliases{$receiver};
    $used{"$receiver_class.$method"} = 1;
    push @errors, "$receiver_class.$method() được gọi trên $receiver nhưng không có trong class diagram"
        unless $methods{$receiver_class}{$method};

    if ($sender eq $receiver && ($kind{$receiver} // '') ne 'boundary') {
        my $key = "$receiver_class.$method";
        push @errors, "self-call $key() không thuộc danh sách hành vi nghiệp vụ được phép"
            unless $allowed_business_self_call{$key};
    }
}

for my $class (sort keys %public_methods) {
    for my $method (sort keys %{ $public_methods{$class} }) {
        push @errors, "$class.$method() có trong class nhưng không được gọi trên đúng lifeline trong sequence"
            unless $used{"$class.$method"};
    }
}

if (@errors) {
    print "$_\n" for @errors;
    exit 1;
}
PERL
  ); then
    while IFS= read -r pair_error; do
      [[ -n "${pair_error}" ]] && report_error "$(basename "${sequence_file}"): ${pair_error}"
    done <<< "${pair_output}"
  fi
done < <(find "${UML_DIR}" -maxdepth 1 -name '*-class.puml' ! -name 'thong-bao-class.puml' ! -name 'tong-quan-dashboard-class.puml' | sort)

if rg -n '\b(note|Controller|DTO|PhienDuLieu)\b|-->' "${UML_DIR}" \
  --glob '*-sequence.puml' --glob '!thong-bao-sequence.puml' --glob '!tong-quan-dashboard-sequence.puml'; then
  report_error "Sequence diagram còn token bị cấm hoặc return arrow."
fi

if [[ ${errors} -ne 0 ]]; then
  echo "Kiểm tra UML thất bại với ${errors} lỗi." >&2
  exit 1
fi

echo "Đã kiểm tra 31 cặp UML: thuộc tính màn hình, receiver, method hai chiều và self-call đều hợp lệ."
