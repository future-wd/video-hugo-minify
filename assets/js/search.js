import Fuse from 'fuse.js'

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const searchParam = urlParams.get('search')

const searchResults = document.getElementById('js-searchResults');


// use hugo to generate the search index
const fuseIndex = 
{{- $.Scratch.Add "index" slice -}}
{{- $pages := site.RegularPages }}
{{- /* $products = where $products "Params.private" "!=" true */ -}}
{{- range $pages -}}
    {{- $.Scratch.Add "index" (dict "title" .Title "categories" .Params.categories "summary" .Summary "relPermalink" .RelPermalink) -}}
{{- end -}}
{{- $.Scratch.Get "index" | jsonify -}} ;

const fuse = new Fuse(fuseIndex, { // fuse.js options; check fuse.js website for details
  shouldSort: true,
  location: 0,
  distance: 100,
  threshold: 0.4,
  minMatchCharLength: 2,
  keys: [
    'title',
    'relPermalink',
    'summary',
    ],
});
// ==========================================
// using the index we loaded
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {
  let results = fuse.search(term); // the actual query being run using fuse.js
  let searchitems = ''; // our results bucket
  // searchResults.classList.remove(hiddenClass);
  if (results.length === 0) { // no results based on what was typed into the input box
    searchitems = searchitems + '<li><div class="title">No items found</div></li>';
  } else { // build our html 
    for (let result in results.slice(0,5)) { // only show first 5 results
      console.log(JSON.stringify(results[result].item));
      searchitems = searchitems + 
        '<li class="mb-3">' + '<div class="search-results__title"><a href="' + results[result].item.relPermalink + '">' + results[result].item.title + '</a></div>' +
        // '<div class="search-results__section">'+ results[result].item.section +'</div>' +
        '<div class="search-results__summary">'+ results[result].item.summary +'</div>' +
        '</li>';
    }
  }

  searchResults.innerHTML = searchitems;
  console.log(JSON.stringify(results))
}

executeSearch(searchParam);