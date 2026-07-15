import rawAdministrativeUnits from "@/features/residence/data/vietnam-administrative-units.json";

type RawWard = {
  Code: string;
  FullName: string;
  ProvinceCode: string;
};

type RawProvince = {
  Code: string;
  FullName: string;
  Wards: RawWard[];
};

export type VietnamWard = {
  code: string;
  name: string;
  provinceCode: string;
};

export type VietnamProvince = {
  code: string;
  name: string;
  wards: VietnamWard[];
};

export const vietnamProvinces: VietnamProvince[] = (rawAdministrativeUnits as RawProvince[]).map(
  (province) => ({
    code: province.Code,
    name: province.FullName,
    wards: province.Wards.map((ward) => ({
      code: ward.Code,
      name: ward.FullName,
      provinceCode: ward.ProvinceCode,
    })),
  }),
);

const provincesByCode = new Map(vietnamProvinces.map((province) => [province.code, province]));

export function getVietnamProvince(provinceCode: string) {
  return provincesByCode.get(provinceCode);
}

export function getVietnamWards(provinceCode: string) {
  return getVietnamProvince(provinceCode)?.wards ?? [];
}

export function isValidVietnamAddress(provinceCode: string, wardCode: string) {
  return getVietnamWards(provinceCode).some((ward) => ward.code === wardCode);
}

export function formatVietnamAddress(
  street: string,
  provinceCode: string,
  wardCode: string,
) {
  const province = getVietnamProvince(provinceCode);
  const ward = province?.wards.find((item) => item.code === wardCode);
  if (!province || !ward) return "";
  return [street.trim(), ward.name, province.name].filter(Boolean).join(", ");
}
