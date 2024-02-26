export type JSONValue = string | number | boolean | null | JSONObject | JSONValue[];

export type JSONObject = {
  [key: string]: JSONValue;
};