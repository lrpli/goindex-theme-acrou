const maxRecentFiles = 12;

function readLibrary(storageKey = "go2index-library") {
  try {
    const library = JSON.parse(localStorage.getItem(storageKey));
    return {
      favorites: Array.isArray(library && library.favorites)
        ? library.favorites
        : [],
      recent: Array.isArray(library && library.recent) ? library.recent : [],
    };
  } catch (error) {
    return { favorites: [], recent: [] };
  }
}

function saveLibrary(library, storageKey = "go2index-library") {
  try {
    localStorage.setItem(storageKey, JSON.stringify(library));
  } catch (error) {
    return false;
  }
  return true;
}

function serializeFile(file) {
  return {
    id: file.id,
    name: file.name,
    path: file.path,
    mimeType: file.mimeType,
    isFolder: file.isFolder,
    thumbnailLink: file.thumbnailLink || "",
    modifiedTime: file.modifiedTime,
    modifiedTimestamp: file.modifiedTimestamp,
    size: file.size,
    sizeValue: file.sizeValue,
  };
}

export function getLibrary(storageKey = "go2index-library") {
  return readLibrary(storageKey);
}

export function toggleFavorite(file, storageKey = "go2index-library") {
  const library = readLibrary(storageKey);
  const index = library.favorites.findIndex((item) => item.path === file.path);

  if (index === -1) {
    library.favorites.unshift(serializeFile(file));
  } else {
    library.favorites.splice(index, 1);
  }

  saveLibrary(library, storageKey);
  return library.favorites;
}

export function addRecent(
  file,
  maxRecentFilesLimit = maxRecentFiles,
  storageKey = "go2index-library"
) {
  const library = readLibrary(storageKey);
  const item = serializeFile(file);
  library.recent = library.recent.filter((recent) => recent.path !== item.path);
  library.recent.unshift(item);
  library.recent = library.recent.slice(0, maxRecentFilesLimit);

  saveLibrary(library, storageKey);
  return library.recent;
}
