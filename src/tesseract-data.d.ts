// @tesseract.js-data/eng ships no types: it exports where its English data sits.
declare module "@tesseract.js-data/eng" {
  const eng: { code: string; gzip: boolean; langPath: string };
  export default eng;
}
