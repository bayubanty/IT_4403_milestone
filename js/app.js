let bookshelfBooks = [];
let searchBooks = [];
let currentPage = 1;
let perPage = 10;
let currentLayout = "grid";
let currentView = "search";
let searchHistory = [];

$(document).ready(function () {
  // Load bookshelf from local JSON
  $.getJSON("assets/google-books-placeholder.json", function (data) {
    bookshelfBooks = data.items.map((book, i) => normalizeBook(book, i));
    renderBookshelf();
  });

  // Navigation
  $("#searchTab").click(() => switchTab("search"));
  $("#bookshelfTab").click(() => switchTab("bookshelf"));

  // Search
  $("#searchBtn").click(() => {
    const term = $("#searchTerm").val().trim();
    if (!term) return;
    fetchGoogleBooks(term);
    if (!searchHistory.includes(term)) {
      searchHistory.unshift(term);
      if (searchHistory.length > 5) searchHistory.pop();
      renderHistory();
    }
  });

  $("#searchHistory").on("click", ".history-item", function () {
    const term = $(this).text();
    $("#searchTerm").val(term);
    fetchGoogleBooks(term);
  });

  // Layout view toggle
  $("#viewToggle").change(function () {
    currentLayout = $(this).val();
    renderBooks();
    renderBookshelf();
  });

  // Book card click
  $("#bookResults, #bookshelf").on("click", ".book-card", function () {
    const index = $(this).data("index");
    const book = currentView === "search" ? searchBooks[index] : bookshelfBooks[index];
    showDetails(book);
  });

  // Back from detail view
  $("#backBtn").click(() => {
    $("#detail-view").hide();
    $(".view").show();
  });
});

function normalizeBook(book, index) {
  const info = book.volumeInfo || {};
  return {
    index,
    title: info.title || "No Title",
    authors: (info.authors || []).join(", "),
    publisher: info.publisher || "Unknown",
    publishedDate: info.publishedDate || "N/A",
    description: info.description || "No description.",
    thumbnail: info.imageLinks?.thumbnail || "https://via.placeholder.com/100x150",
  };
}

function fetchGoogleBooks(term) {
  $.getJSON(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&maxResults=40`, function (data) {
    searchBooks = (data.items || []).map((book, i) => normalizeBook(book, i));
    currentPage = 1;
    renderBooks();
  });
}

function switchTab(tab) {
  currentView = tab;
  $(".nav-link").removeClass("active");
  $(`#${tab}Tab`).addClass("active");
  $(".view").removeClass("active");
  $(`#${tab}View`).addClass("active");
  $("#detail-view").hide();
}

function renderBooks() {
  const start = (currentPage - 1) * perPage;
  const shown = searchBooks.slice(start, start + perPage);
  const template = $("#book-template").html();
  const rendered = shown.map(book => Mustache.render(template, { ...book, layout: currentLayout })).join("");
  $("#bookResults").attr("class", `book-${currentLayout}`).html(rendered);
  renderPagination(searchBooks.length);
}

function renderBookshelf() {
  const template = $("#book-template").html();
  const rendered = bookshelfBooks.map(book => Mustache.render(template, { ...book, layout: currentLayout })).join("");
  $("#bookshelf").attr("class", `book-${currentLayout}`).html(rendered);
}

function showDetails(book) {
  const template = $("#book-detail-template").html();
  const rendered = Mustache.render(template, book);
  $("#bookDetail").html(rendered);
  $(".view").hide();
  $("#detail-view").show();
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / perPage);
  let buttons = "";
  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
  }
  $("#pagination").html(buttons);
}

function changePage(page) {
  currentPage = page;
  renderBooks();
}

function renderHistory() {
  const html = searchHistory.map(term => `<span class="history-item">${term}</span>`).join(" ");
  $("#searchHistory").html(`<div><strong>Recent Searches:</strong> ${html}</div>`);
}
