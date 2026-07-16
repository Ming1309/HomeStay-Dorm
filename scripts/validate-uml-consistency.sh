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

class_count=$(find "${UML_DIR}" -maxdepth 1 -name '*-class.puml' ! -name 'thong-bao-class.puml' | wc -l | tr -d ' ')
sequence_count=$(find "${UML_DIR}" -maxdepth 1 -name '*-sequence.puml' ! -name 'thong-bao-sequence.puml' | wc -l | tr -d ' ')
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

  while IFS= read -r participant; do
    rg -q "class[[:space:]]+${participant}([[:space:]#\{]|$)" "${class_file}" ||
      report_error "$(basename "${sequence_file}"): lifeline ${participant} không có trong class diagram."
  done < <(env LC_ALL=C perl -ne 'print "$1\n" if /^\s*(?:boundary|control|entity)\s+"?:?\s*([A-Za-z_][A-Za-z0-9_]*)/' "${sequence_file}" | sort -u)

  while IFS= read -r method; do
    rg -q "^[[:space:]]*[+~-][[:space:]]+${method}\\(" "${class_file}" ||
      report_error "$(basename "${sequence_file}"): ${method}() không có trong class diagram."
  done < <(env LC_ALL=C perl -ne 'print "$1\n" if /:\s*(?:[0-9.]+\s+)?([A-Za-z_][A-Za-z0-9_]*)\(/' "${sequence_file}" | sort -u)

  while IFS= read -r method; do
    rg -q ":[[:space:]]*(?:[0-9.]+[[:space:]]+)?${method}\\(" "${sequence_file}" ||
      report_error "$(basename "${class_file}"): ${method}() không xuất hiện trong sequence diagram."
  done < <(env LC_ALL=C perl -ne 'print "$1\n" if /^\s*\+\s+([A-Za-z_][A-Za-z0-9_]*)\(/' "${class_file}" | sort -u)
done < <(find "${UML_DIR}" -maxdepth 1 -name '*-class.puml' ! -name 'thong-bao-class.puml' | sort)

if rg -n '\b(note|Controller|DTO|PhienDuLieu)\b|-->' "${UML_DIR}" \
  --glob '*-sequence.puml' --glob '!thong-bao-sequence.puml'; then
  report_error "Sequence diagram còn token bị cấm hoặc return arrow."
fi

if [[ ${errors} -ne 0 ]]; then
  echo "Kiểm tra UML thất bại với ${errors} lỗi." >&2
  exit 1
fi

echo "Đã kiểm tra 31 cặp UML: thuộc tính màn hình, lifeline và method hai chiều đều hợp lệ."
