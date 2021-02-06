import axios from 'axios';
import jsdom from 'jsdom';
import fs from 'fs';
const { JSDOM } = jsdom;
const stream = fs.createWriteStream('articles_full_text.txt');

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getFullArticle = async(caseId) => {
  console.log('caseId', caseId);
  try {
    const { data } = await axios.get('https://www.berlin.de/polizei/polizeimeldungen/pressemitteilung.' + caseId + '.php');
    const pageAsDom = new JSDOM(data);
    const article = pageAsDom.window.document.getElementsByClassName('html5-section article')
    const articleText = article[0].textContent;
    stream.write(caseId + '|' + articleText + '\r\n');
  } catch (error) {
    console.log(error);
  }
};

const fetchAllArticles = async() => {
  const fileData = fs.readFileSync('case_ids.txt', { encoding: 'UTF-8' });
  const caseIds = fileData.split('\n');

  const caseIdsArray = caseIds.filter(caseId => !!caseId);
  for (const caseId of caseIdsArray) {
    await sleep(12000);
    getFullArticle(caseId);
  }
}

fetchAllArticles();
