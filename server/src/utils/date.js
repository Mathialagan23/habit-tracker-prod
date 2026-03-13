const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const todayUTC = () => normalizeDate(new Date());

const daysBetween = (a, b) => {
  const msPerDay = 86400000;
  return Math.round(Math.abs(normalizeDate(a) - normalizeDate(b)) / msPerDay);
};

module.exports = { normalizeDate, todayUTC, daysBetween };
