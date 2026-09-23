import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("frontend/app/[tenant]/(admin)/dashboard/components/CalculatorTab.tsx", "utf8");

assert.match(source, /config\.sections\.estimate \?\? SAMPLE_ESTIMATE/, "the calculator must always fall back to a sample model");
assert.doesNotMatch(source, /Calculator is not configured/, "the calculator must not be hidden behind workspace configuration");
assert.match(source, /setEstimate\(initial\)/, "reset must restore the available calculator model");

console.log("calculator availability checks passed");
