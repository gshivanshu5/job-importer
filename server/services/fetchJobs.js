const axios = require('axios');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

const feedUrls = [
  'https://jobicy.com/?feed=job_feed',
  'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
  'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
  'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
  'https://jobicy.com/?feed=job_feed&job_categories=data-science',
  'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
  'https://jobicy.com/?feed=job_feed&job_categories=business',
  'https://jobicy.com/?feed=job_feed&job_categories=management',
];

const fetchJobsFromFeeds = async () => {
  const allJobs = [];
  for (const url of feedUrls) {
    try {
      const { data: xml } = await axios.get(url);
      const json = await parser.parseStringPromise(xml);
      const items = json.rss?.channel?.item || [];
      const jobs = Array.isArray(items) ? items : [items];
      allJobs.push(...jobs);
      console.log(`Fetching jobs from: ${url}`);
    } catch (err) {
      console.error(`❌ Error fetching from ${url}:`, err.message);
    }
  }
  return allJobs;
};


module.exports = { fetchJobsFromFeeds };