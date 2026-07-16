#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

SOURCE_DIR="${1:-${ROOT_DIR}/docs/uml}"
OUTPUT_DIR="${2:-${ROOT_DIR}/diagram}"
PNG_DIR="${OUTPUT_DIR}/png"
SVG_DIR="${OUTPUT_DIR}/svg"

if ! command -v plantuml >/dev/null 2>&1; then
  echo "Không tìm thấy PlantUML. Hãy cài bằng: brew install plantuml" >&2
  exit 1
fi

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Không tìm thấy thư mục chứa PlantUML: ${SOURCE_DIR}" >&2
  exit 1
fi

files=()
while IFS= read -r -d '' file; do
  files+=("${file}")
done < <(find "${SOURCE_DIR}" -type f -name '*.puml' -print0 | sort -z)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "Không tìm thấy file .puml trong: ${SOURCE_DIR}" >&2
  exit 1
fi

mkdir -p "${PNG_DIR}" "${SVG_DIR}"

# Một số class diagram rộng hơn giới hạn ảnh mặc định của PlantUML.
export PLANTUML_LIMIT_SIZE="${PLANTUML_LIMIT_SIZE:-16384}"

echo "Kiểm tra ${#files[@]} file PlantUML..."
plantuml -checkonly "${files[@]}"

echo "Đang xuất PNG vào ${PNG_DIR}..."
plantuml -charset UTF-8 -tpng -o "${PNG_DIR}" "${files[@]}"

echo "Đang xuất SVG vào ${SVG_DIR}..."
plantuml -charset UTF-8 -tsvg -o "${SVG_DIR}" "${files[@]}"

echo "Hoàn tất: ${#files[@]} file PNG và ${#files[@]} file SVG."
