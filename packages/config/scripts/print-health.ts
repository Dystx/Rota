import {
  assertNoSecretLeak,
  formatProviderHealthReport,
  getProviderHealthReport
} from "../src/health.ts";

const report = getProviderHealthReport();
const output = formatProviderHealthReport(report);
assertNoSecretLeak(output);
process.stdout.write(`${output}\n`);
