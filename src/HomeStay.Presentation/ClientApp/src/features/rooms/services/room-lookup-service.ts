import { z } from "zod";
import type { Asset, BedStatus, Room, RoomStatus } from "@/app/providers/workflow-store";

const roomTypeSchema = z.object({ tenLoaiPhong: z.string().min(1) });
const bedSchema = z.object({
  maGiuong: z.string().min(1),
  soGiuong: z.string().min(1),
  trangThai: z.string().min(1),
});
const roomSchema = z.object({
  maPhong: z.string().min(1),
  soPhong: z.string().min(1),
  toaNha: z.string().nullish(),
  tang: z.string().nullish(),
  trangThai: z.string().min(1),
  soGiuongTrong: z.number().int().nonnegative(),
  loaiPhong: z.object({
    tenLoaiPhong: z.string().min(1),
    giaThue: z.number().nonnegative(),
    sucChua: z.number().int().nonnegative(),
  }),
  giuongs: z.array(bedSchema),
});
const assetSchema = z.object({
  maTS: z.string().min(1),
  soLuongTieuChuan: z.number().int().nonnegative(),
  taiSan: z.object({ tenTaiSan: z.string().min(1) }),
});

async function readJson<T>(response: Response, schema: z.ZodType<T>, message: string): Promise<T> {
  if (!response.ok) throw new Error(message);
  const result = schema.safeParse(await response.json());
  if (!result.success) throw new Error("Dữ liệu phòng từ máy chủ không đúng định dạng.");
  return result.data;
}

function mapBedStatus(status: string): BedStatus {
  if (status === "Trong") return "available";
  if (status === "DaCoc" || status === "GiuCho") return "deposited";
  if (status === "DangSuDung") return "occupied";
  return "maintenance";
}

function mapRoomStatus(status: string): RoomStatus {
  if (status === "Trong") return "available";
  if (status === "ConGiuongTrong" || status === "GiuCho") return "partially_available";
  if (status === "DaCoc" || status === "DangSuDung") return "full";
  return "maintenance";
}

export const roomLookupService = {
  async listRoomTypes(): Promise<string[]> {
    const values = await readJson(await fetch("/api/room-types"), z.array(roomTypeSchema), "Không thể tải loại phòng.");
    return values.map((value) => value.tenLoaiPhong);
  },

  async search(): Promise<Room[]> {
    const values = await readJson(await fetch("/api/rooms/search"), z.array(roomSchema), "Không thể tải danh sách phòng.");
    return values.map((value) => ({
      id: value.maPhong,
      code: value.soPhong,
      area: value.tang ?? value.toaNha ?? "—",
      type: value.loaiPhong.tenLoaiPhong,
      maxCapacity: value.loaiPhong.sucChua,
      basePrice: value.loaiPhong.giaThue,
      beds: value.giuongs.map((bed) => ({ id: bed.maGiuong, code: bed.soGiuong, status: mapBedStatus(bed.trangThai) })),
      assets: [],
      status: mapRoomStatus(value.trangThai),
    }));
  },

  async listAssets(roomId: string): Promise<Asset[]> {
    const values = await readJson(
      await fetch(`/api/rooms/${encodeURIComponent(roomId)}/assets`),
      z.array(assetSchema),
      "Không thể tải tài sản phòng.",
    );
    return values.map((value) => ({
      id: value.maTS,
      name: value.taiSan.tenTaiSan,
      quantity: value.soLuongTieuChuan,
      condition: "—",
    }));
  },
};
