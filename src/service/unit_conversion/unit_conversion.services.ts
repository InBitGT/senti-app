import { post } from "@/apis";
import { ENDPOINT } from "@/lib";
import { UnitConversion } from "@/src/types/unit_conversion/unit_conversion.types";

export async function PostUnitConversion(data: UnitConversion) {
  const response = await post<UnitConversion>(
    ENDPOINT.unitConversion.info,
    data,
  );
  console.log(response, "post");
  if (response.code !== "201") {
    throw new Error(response.message);
  }

  return response.data;
}
