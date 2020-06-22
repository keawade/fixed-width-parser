type Json = string | number | boolean | null | JsonObject | Json[];
export type JsonObject = {
  [property: string]: Json;
};
