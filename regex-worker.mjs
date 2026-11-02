self.onmessage = ({ data: { text, pattern, flags } }) => {
  try {
    const re = new RegExp(pattern, flags);
    const results = [];
    if (re.global) {
      let match;
      while ((match = re.exec(text)) && results.length < 2000) {
        results.push({
          index: match.index,
          match: match[0],
          groups: match.slice(1),
        });
        if (!match[0]) re.lastIndex++;
      }
    } else {
      const m = re.exec(text);
      if (m) results.push({ index: m.index, match: m[0], groups: m.slice(1) });
    }
    self.postMessage({ result: JSON.stringify(results, null, 2) });
  } catch (e) {
    self.postMessage({ error: e.message });
  }
};
