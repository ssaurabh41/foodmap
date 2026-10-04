import { SAMPLE_DATA, type Dataset } from "@foodmap/core";

/**
 * The single place the UI gets its data from. Today it returns the fictional sample set;
 * later it will fetch the pipeline's published dataset.
 */
export function loadDataset(): Dataset {
  return SAMPLE_DATA;
}
