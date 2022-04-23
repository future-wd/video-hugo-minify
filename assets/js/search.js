import Fuse from 'fuse.js/dist/fuse.basic.esm';
import Mark from 'mark.js/dist/mark.es6';

// add loading indicator
// load external json to keep file sizes down
// https://ben.land/post/2021/12/02/hugo-search-functionality/


// const summaryLength = 400 // character length of summary
const searchLoading = document.getElementById('js-searchLoading'); // div for loading text
const hiddenClass = 'd-none'; // class for hiding divs (to avoid inline styles)
const searchResults = document.getElementById('js-searchResults'); // div for results
const searchInput = document.getElementById('js-searchInput'); // search input id

// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open('GET', path);
  httpRequest.send();
}

// ==========================================
// extract named parameter from page url
// ==========================================
function param(name) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(name);
}

// check to see if a search has taken place
const searchQuery = param('q');
if (searchQuery) {
  // populate search input with the search query
  searchInput.value = searchQuery;
  // load json and start searching
  fetchJSONFile('/search/index.json', runSearch);
} else {
  // hide loading div
  searchLoading.classList.add(hiddenClass);
  searchResults.innerHTML = '<div>Please search via the search bar at the top right of the screen.</div>';
}

// ==========================================
// function: capitalise first letter of each word
// ==========================================
function titleCase(string) {
  const words = string.split(' '); // split based on spaces
  words.forEach((word, key) => {
    words[key] = word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  });
  return words.join(' ');
}

// ==========================================
// execute search, and display results
// ==========================================
function runSearch(data) {
  const options = { // fuse.js options; check fuse.js website for details
    // ignoreLocation: true, // match anywhere in the strings
    // threshold: 0.4, // 0.0 requires perfect score, 1 matches anything. default 0.6
    minMatchCharLength: 2, // ignores single digit matches
    // includeMatches: true, // for highlighting purposes (without library)
    findAllMatches: true, // finishes searching pattern, even if an exact match is found
    keys: [ // keys included in search
      'title', // weight defaults to 1
      { name: 'companies', weight: 0.4 },
      { name: 'species', weight: 0.4 },
      { name: 'content', weight: 0.7 },
      { name: 'summary', weight: 0.8 }
    ],
  };
  const fuse = new Fuse(data, options);
  const results = fuse.search(searchQuery); // the actual query being run using fuse.js
  // hide loading div
  searchLoading.classList.add(hiddenClass);
  showResults(results);
}
// ==========================================
// Show results
// ==========================================
function showResults(results) {
  if (!results.length) { // no results based on what was typed into the input box
    searchResults.innerHTML = '<div>No items found</div>';
  } else { // build our html 
    // iterate over results
    results.forEach((value, key) => {
      // assign constants to items inside map
      const { title, companies, species, images, summary, permalink } = value.item;
      // // shorten the content length and add "..."
      // const snippet = content.substring(0, summaryLength) + '&hellip;'
      // // replace values
      // array for seperated categories
      // has to be defined as array so that categories.length works on empty array

      function createLinks (taxonomy, titleSingle, titlePlural) {
        let taxonomyHTML = '';
        // check for categories, we don't need to check for length, as an empty array is never produced.
        if (taxonomy.length) {
          // create category links in an array
          const taxonomyArray = Array.from(taxonomy, value => {
            return `<a href="/categories/${value}">${titleCase(value)}</a>`
          });
          // display 'category' or 'categories'
          let taxonomyText = titleSingle;
          if ((titlePlural) && (taxonomyArray.length >= 2)) {
            taxonomyText = titlePlural;
          }
          // create HTML
          taxonomyHTML = `
          <div class="pb-1">
            <small>${taxonomyText}: <span class="highlight">${taxonomyArray.join(", ")}</span></small>
          </div>`
        }
        return taxonomyHTML
      }
      
      // output html
      var output = `
        <div id="summary-${key}" class="pb-3">
          <div class="row">
            <div class="col-sm-2">
            <img src="${permalink + images[0]}" alt="${title} image" style="max-height:10rem;width:auto;">
            </div>
            <div class="col-sm-10">
              <h3 class="mb-1 highlight"><a href="${permalink}" class="text-decoration-none">${title}</a></h3>
              <div class="mb-1"><a class="link-dark" href="${permalink}">${permalink}</a></div>
              ${createLinks(companies, 'Company', 'Companies')}
              ${createLinks(species, 'Species')}
              <div class="lh-sm highlight">${summary}</div>
            </div>
          </div>
        </div>`
      searchResults.innerHTML += output; // append html to DOM element
    });
    // highlight text based on search query
    // highlight all
    // var instance = new Mark(searchResults);
    // only highlight targetted divs
    var instance = new Mark('.highlight');
    instance.mark(searchQuery);
  }
}
