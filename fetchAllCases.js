import axios from 'axios';
import jsdom from 'jsdom';
import fs from 'fs';
const { JSDOM } = jsdom;
const stream = fs.createWriteStream('results_with_links.txt');


const writeToFile = (textContent) => {
  if (!textContent) {
  return;
  }
  stream.write(textContent + '\r\n');
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getArchivePage = async(page) => {
  console.log('page', page);
  try {
    const { data } = await axios.get('https://www.berlin.de/polizei/polizeimeldungen/archiv/2020/?page_at_1_0=' + page);
    const pageAsDom = new JSDOM(data);
    const eventList = pageAsDom.window.document.getElementsByClassName('row-fluid');
    stream.write('page ' + page + '\r\n');
    Array.from(eventList).forEach( event => {
      const anchorTagList = event.getElementsByTagName('a')
      writeToFile(event.textContent + '|link: ' + anchorTagList[0].href)
    })

  } catch (error) {
    console.log(error);
  }
};

const loopAllPages = async() => {
  for (let i = 1; i < 53; i++) {
  await sleep(12000);
  getArchivePage(i);
  }
}

loopAllPages();
