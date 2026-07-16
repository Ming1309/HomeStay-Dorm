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

# Checklist cụ thể cho sáu boundary phiếu cọc. Kiểm tra >= 3 thuộc tính ở dưới chỉ
# phát hiện màn hình rỗng, không phát hiện việc bỏ sót từng control nghiệp vụ.
required_deposit_gui_elements=(
  'lap-phieu-coc-class.puml|- txtTimKiemLichHen: TextBox'
  'lap-phieu-coc-class.puml|- grvLichHenChoCoc: GridView'
  'lap-phieu-coc-class.puml|- txtHoTen: TextBox'
  'lap-phieu-coc-class.puml|- rdoThueOGhep: RadioButton'
  'lap-phieu-coc-class.puml|- rdoThueNguyenPhong: RadioButton'
  'lap-phieu-coc-class.puml|- grvDanhSachPhong: GridView'
  'lap-phieu-coc-class.puml|- grvDanhSachGiuong: GridView'
  'lap-phieu-coc-class.puml|- dlgXacNhanTaoPhieu: AlertDialog'
  'tinh-tien-coc-class.puml|- grvPhieuCocKhoiTao: GridView'
  'tinh-tien-coc-class.puml|- lblCongThucTinhTien: Label'
  'tinh-tien-coc-class.puml|- lblTongTien: Label'
  'tinh-tien-coc-class.puml|- grvGiuongDaChon: GridView'
  'ghi-nhan-thanh-toan-coc-class.puml|- lblHanThanhToan: Label'
  'ghi-nhan-thanh-toan-coc-class.puml|- lblThoiGianConLai: Label'
  'ghi-nhan-thanh-toan-coc-class.puml|- lstPhuongThucThanhToan: ListBox'
  'ghi-nhan-thanh-toan-coc-class.puml|- uplChungTu: FileUpload'
  'ghi-nhan-thanh-toan-coc-class.puml|- btnThayDoiChungTu: Button'
  'ghi-nhan-thanh-toan-coc-class.puml|- btnXoaChungTu: Button'
  'ghi-nhan-thanh-toan-coc-class.puml|- dlgXemChungTu: Dialog'
  'xac-nhan-khoan-tien-coc-class.puml|- lblPhuongThucThanhToan: Label'
  'xac-nhan-khoan-tien-coc-class.puml|- lblNhanVienSale: Label'
  'xac-nhan-khoan-tien-coc-class.puml|- grvGiuongSeKhoa: GridView'
  'xac-nhan-khoan-tien-coc-class.puml|- txtLyDoYeuCauBoSung: TextArea'
  'xac-nhan-khoan-tien-coc-class.puml|- dlgXemChungTu: Dialog'
  'xac-nhan-khoan-tien-coc-class.puml|- dlgXacNhanHopLe: AlertDialog'
  'xac-nhan-khoan-tien-coc-class.puml|- dlgYeuCauBoSung: AlertDialog'
  'tra-cuu-phieu-coc-class.puml|- txtMaPhieuCoc: TextBox'
  'tra-cuu-phieu-coc-class.puml|- txtSDT: TextBox'
  'tra-cuu-phieu-coc-class.puml|- txtEmail: TextBox'
  'tra-cuu-phieu-coc-class.puml|- txtSoGiayTo: TextBox'
  'tra-cuu-phieu-coc-class.puml|- grvKetQua: GridView'
  'tra-cuu-phieu-coc-class.puml|- grvGiuongLienQuan: GridView'
  'huy-phieu-coc-class.puml|- txtTimKiemPhieu: TextBox'
  'huy-phieu-coc-class.puml|- grvPhieuCocCoTheHuy: GridView'
  'huy-phieu-coc-class.puml|- lblTrangThaiThanhToan: Label'
  'huy-phieu-coc-class.puml|- grvGiuongLienQuan: GridView'
  'huy-phieu-coc-class.puml|- dlgXacNhanHuy: AlertDialog'
)
for required in "${required_deposit_gui_elements[@]}"; do
  file="${required%%|*}"
  element="${required#*|}"
  rg -Fq -- "${element}" "${UML_DIR}/${file}" \
    || report_error "${file} thiếu control bắt buộc: ${element}"
done

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
my (%classes, %methods, %method_arities, %public_methods, %aliases, %kind, %used);
my @errors;
my $check_arity = $sequence_file =~ m{/(?:lap-phieu-coc|tinh-tien-coc|ghi-nhan-thanh-toan-coc|xac-nhan-khoan-tien-coc|tra-cuu-phieu-coc|huy-phieu-coc)-sequence\.puml$};

sub argument_count {
    my ($arguments) = @_;
    $arguments =~ s/^\s+|\s+$//g;
    return 0 if $arguments eq '';
    return scalar split /\s*,\s*/, $arguments;
}

open my $class_fh, '<', $class_file or die $!;
my $current_class;
while (my $line = <$class_fh>) {
    if ($line =~ /^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)\b/) {
        $current_class = $1;
        $classes{$current_class} = 1;
        next;
    }
    if (defined $current_class && $line =~ /^\s*([+~-])\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^\)]*)\)/) {
        my ($visibility, $method, $arguments) = ($1, $2, $3);
        my @parameters = $arguments =~ /^\s*$/ ? () : split /\s*,\s*/, $arguments;
        my $maximum = scalar @parameters;
        my $minimum = scalar grep { $_ !~ /=/ } @parameters;
        $methods{$current_class}{$method} = 1;
        push @{ $method_arities{$current_class}{$method} }, [$minimum, $maximum];
        $public_methods{$current_class}{$method} = 1 if $visibility eq '+';
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
    Phong.GiuGiuong
    Phong.GiuNguyenPhong
    Phong.KiemTraGioiTinhChoPhep
);

for my $line (@sequence_lines) {
    next unless $line =~ /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*-+>\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(?:[0-9]+(?:\.[0-9]+)*\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\(([^\)]*)\)/;
    my ($sender, $receiver, $method, $arguments) = ($1, $2, $3, $4);
    next unless exists $aliases{$receiver};

    my $receiver_class = $aliases{$receiver};
    $used{"$receiver_class.$method"} = 1;
    push @errors, "$receiver_class.$method() được gọi trên $receiver nhưng không có trong class diagram"
        unless $methods{$receiver_class}{$method};

    if ($check_arity && $methods{$receiver_class}{$method}) {
        my $actual = argument_count($arguments);
        my $matches = grep {
            my ($minimum, $maximum) = @$_;
            $actual >= $minimum && $actual <= $maximum;
        } @{ $method_arities{$receiver_class}{$method} };
        push @errors, "$receiver_class.$method() được gọi với $actual tham số nhưng class diagram không có chữ ký phù hợp"
            unless $matches;
    }

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

echo "Đã kiểm tra 31 cặp UML; nhóm 6 UC phiếu cọc được kiểm tra thêm số tham số của từng message."
