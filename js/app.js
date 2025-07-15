let allBooks = [];
let currentPage = 1;
let perPage = 10;
let currentLayout = "grid";
let currentView = "search";
let searchHistory = [];

$(document).ready(function () {
  // Load books
  $.getJSON("assets/google-books-placeholder.json", function (data) {
    allBooks = data.items.map((book, i) => ({
      index: i,
      title: book.volumeInfo.title,
      authors: (book.volumeInfo.authors || []).join(", "),
      publisher: book.volumeInfo.publisher,
      publishedDate: book.volumeInfo.publishedDate,
      description: book.volumeInfo.description,
      thumbnail: book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/100x150",
    }));
    renderBooks();
  });

  // Navigation tabs
  $("#searchTab").click(() => switchTab("search"));
  $("#bookshelfTab").click(() => switchTab("bookshelf"));

  // Search
  $('#searchBtn').click(() => {
    const term = $('#searchTerm').val().trim();
    if (term && !searchHistory.includes(term)) {
      searchHistory.unshift(term);
      if (searchHistory.length > 5) searchHistory.pop();
      renderHistory();
    }
    currentPage = 1;
    renderBooks(term);
  });

  // Search history click
  $('#searchHistory').on('click', '.history-item', function () {
    const term = $(this).text();
    $('#searchTerm').val(term);
    renderBooks(term);
  });

  // Layout toggle
  $('#viewToggle').change(function () {
    currentLayout = $(this).val();
    renderBooks($('#searchTerm').val());
  });

  // Book click event
  $('#bookResults, #bookshelf').on('click', '.book-card', function () {
    const index = $(this).data('index');
    showDetails(allBooks[index]);
  });

  // Back button
  $('#backBtn').click(() => {
    $('#detail-view').hide();
    $('#bookResults').show();
    $('#bookshelf').show();
  });
});

function switchTab(tab) {
  currentView = tab;
  $('.nav-link').removeClass('active');
  $(`#${tab}Tab`).addClass('active');
  $('.view').removeClass('active');
  $(`#${tab}View`).addClass('active');
}

function renderBooks(term = "") {
  const filtered = allBooks.filter(book =>
    book.title.toLowerCase().includes(term.toLowerCase())
  );

  const start = (currentPage - 1) * perPage;
  const booksToShow = filtered.slice(start, start + perPage);

  const template = $('#book-template').html();
  const rendered = booksToShow.map(book => Mustache.render(template, { ...book, layout: currentLayout })).join('');

  if (currentView === "search") {
    $('#bookResults').html(rendered);
  } else {
    $('#bookshelf').html(rendered);
  }

  renderPagination(filtered.length);
}

function showDetails(book) {
  $('#bookResults').hide();
  $('#bookshelf').hide();
  const template = $('#book-detail-template').html();
  const rendered = Mustache.render(template, book);
  $('#bookDetail').html(rendered);
  $('#detail-view').show();
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / perPage);
  let buttons = '';
  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  $('#pagination').html(buttons);
}

function changePage(page) {
  currentPage = page;
  renderBooks($('#searchTerm').val());
}

function renderHistory() {
  const html = searchHistory.map(term => `<span class="history-item">${term}</span>`).join('');
  $('#searchHistory').html(`<div><strong>Recent Searches:</strong> ${html}</div>`);
}
