function readParam(query, key) {
  const value = query[key];
  return typeof value === 'string' ? value.trim() : '';
}

function parsePagination(query) {
  const page = Math.max(parseInt(readParam(query, 'page'), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(readParam(query, 'limit'), 10) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

function buildPaginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

module.exports = { readParam, parsePagination, buildPaginationMeta };
