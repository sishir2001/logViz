import {
  decodeArray,
  __decodeString,
  isJSON,
  noErrorOrNullValues,
  _decodeNumber,
} from "type-decoder";

export type KibanaLogSource = {
  message: string;
  "@timestamp": string;
  tag: string;
};

export type KibanaLogFields = {
  "@timestamp": string[];
};

export type KibanaLogHighlight = {
  message: string[];
};

export type KibanaLog = {
  _index: string;
  _type: string;
  _id: string;
  _version: number;
  _source: KibanaLogSource;
  highlight: KibanaLogHighlight;
  fields: KibanaLogFields;
};

export type CondensedKibanaLog = {
  id: string;
  timestamp: string;
  logMode: string;
  logType: string;
  functionName: string;
  logMessage: string;
};

export function decodeKibanaLogHighlight(raw: any): KibanaLogHighlight | null {
  if (isJSON(raw)) {
    const decodedHighlight = decodeArray<string>(
      raw["message"],
      __decodeString
    );
    if (decodedHighlight !== null) {
      const decodedResponse: KibanaLogHighlight = {
        message: decodedHighlight,
      };
      if (noErrorOrNullValues(decodedResponse)) {
        return decodedResponse;
      }
    }
  }
  return null;
}

export function decodeKibanaLogFields(raw: any): KibanaLogFields | null {
  if (isJSON(raw)) {
    const decodedTimestamp = decodeArray<string>(
      raw["@timestamp"],
      __decodeString
    );
    if (decodedTimestamp !== null) {
      const decodedResponse: KibanaLogFields = {
        "@timestamp": decodedTimestamp,
      };
      if (noErrorOrNullValues(decodedResponse)) {
        return decodedResponse;
      }
    }
  }
  return null;
}

export function decodeKibanaLogSource(raw: any): KibanaLogSource | null {
  if (isJSON(raw)) {
    const decodedResponse: KibanaLogSource = {
      message: __decodeString(raw["message"]),
      "@timestamp": __decodeString(raw["@timestamp"]),
      tag: __decodeString(raw["tag"]),
    };
    if (noErrorOrNullValues(decodedResponse)) {
      return decodedResponse;
    }
  }
  return null;
}

export function decodeKibanaLog(raw: any): KibanaLog | null {
  if (isJSON(raw)) {
    const version = _decodeNumber(raw["_version"]);
    if (version !== undefined) {
      const decodedSource = decodeKibanaLogSource(raw["_source"]);
      const decodedHighlight = decodeKibanaLogHighlight(raw["highlight"]);
      const decodedFields = decodeKibanaLogFields(raw["fields"]);
      if (
        decodedSource === null ||
        decodedHighlight === null ||
        decodedFields === null
      ) {
        return null;
      }
      const decodedResponse: KibanaLog = {
        _index: __decodeString(raw["_index"]),
        _type: __decodeString(raw["_type"]),
        _id: __decodeString(raw["_id"]),
        _version: version,
        _source: decodedSource,
        highlight: decodedHighlight,
        fields: decodedFields,
      };
      if (noErrorOrNullValues(decodedResponse)) {
        return decodedResponse;
      }
    }
  }
  return null;
}
