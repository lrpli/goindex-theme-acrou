<template>
  <div>
    <headmd
      :option="headmd"
      v-if="renderHeadMD && headmd.display"
      style="margin:1rem 0;"
    ></headmd>
    <bread-crumb ref="breadcrumb"></bread-crumb>
    <section v-if="!isSearchPage" class="g2-action-toolbar">
      <button class="button is-small" type="button" @click="createFolder">
        <span class="icon"><i class="fa fa-folder-o" aria-hidden="true"></i></span>
        <span>{{ $t("list.action.createFolder") }}</span>
      </button>
      <button class="button is-small" type="button" @click="reloadList">
        <span class="icon"><i class="fa fa-refresh" aria-hidden="true"></i></span>
        <span>{{ $t("list.action.refresh") }}</span>
      </button>
    </section>
    <section
      v-if="enableLibrary"
      class="g2-library-toolbar"
      :aria-label="$t('library.title')"
    >
      <div class="field is-grouped is-grouped-multiline">
        <p class="control is-expanded">
          <input
            v-model.trim="filterQuery"
            class="input"
            type="search"
            :placeholder="$t('library.filterPlaceholder')"
            :aria-label="$t('library.filterPlaceholder')"
          />
        </p>
        <p class="control">
          <span class="select">
            <select v-model="filterType" :aria-label="$t('library.type')">
              <option value="all">{{ $t('library.types.all') }}</option>
              <option value="folder">{{ $t('library.types.folder') }}</option>
              <option value="image">{{ $t('library.types.image') }}</option>
              <option value="video">{{ $t('library.types.video') }}</option>
              <option value="audio">{{ $t('library.types.audio') }}</option>
              <option value="document">{{ $t('library.types.document') }}</option>
              <option value="archive">{{ $t('library.types.archive') }}</option>
            </select>
          </span>
        </p>
        <p class="control">
          <span class="select">
            <select v-model="sortBy" :aria-label="$t('library.sort')">
              <option value="name-asc">{{ $t('library.sorts.nameAsc') }}</option>
              <option value="name-desc">{{ $t('library.sorts.nameDesc') }}</option>
              <option value="modified-desc">{{ $t('library.sorts.modifiedDesc') }}</option>
              <option value="modified-asc">{{ $t('library.sorts.modifiedAsc') }}</option>
              <option value="size-desc">{{ $t('library.sorts.sizeDesc') }}</option>
              <option value="size-asc">{{ $t('library.sorts.sizeAsc') }}</option>
            </select>
          </span>
        </p>
        <p class="control">
          <button
            class="button"
            :class="{ 'is-warning': favoritesOnly }"
            type="button"
            @click="favoritesOnly = !favoritesOnly"
          >
            <span class="icon"><i class="fa fa-star" aria-hidden="true"></i></span>
            <span>{{ $t('library.favorites') }} ({{ favorites.length }})</span>
          </button>
        </p>
        <p class="control">
          <button class="button" type="button" @click="toggleLibraryMenu">
            <span class="icon"><i class="fa fa-history" aria-hidden="true"></i></span>
            <span>{{ $t('library.history') }}</span>
          </button>
        </p>
      </div>
      <div v-if="libraryMenuOpen" class="g2-library-menu">
        <div class="g2-library-section" v-if="favorites.length">
          <strong>{{ $t('library.favorites') }}</strong>
          <button
            v-for="file in favorites"
            :key="'favorite-' + file.path"
            class="button is-text g2-library-item"
            type="button"
            @click="openStoredFile(file)"
          >
            <i class="fa fa-star" aria-hidden="true"></i>{{ file.name }}
          </button>
        </div>
        <div class="g2-library-section" v-if="recentFiles.length">
          <strong>{{ $t('library.recent') }}</strong>
          <button
            v-for="file in recentFiles"
            :key="'recent-' + file.path"
            class="button is-text g2-library-item"
            type="button"
            @click="openStoredFile(file)"
          >
            <i class="fa fa-history" aria-hidden="true"></i>{{ file.name }}
          </button>
        </div>
        <p v-if="!favorites.length && !recentFiles.length" class="has-text-grey">
          {{ $t('library.empty') }}
        </p>
      </div>
    </section>
    <div class="golist" v-loading="loading">
      <list-view
        :data="visibleFiles"
        v-if="mode === 'list'"
        :icons="getIcon"
        :action="action"
        :is-favorite="isFavorite"
        :toggle-favorite="toggleFavorite"
      />
      <grid-view
        class="g2-content"
        :data="visibleFiles"
        v-if="mode !== 'list'"
        :getIcon="getIcon"
        :action="action"
        :thum="thum"
        :is-favorite="isFavorite"
        :toggle-favorite="toggleFavorite"
      />
      <infinite-loading
        v-show="!loading"
        ref="infinite"
        spinner="bubbles"
        @infinite="infiniteHandler"
      >
        <div slot="no-more"></div>
        <div slot="no-results"></div>
      </infinite-loading>
      <div
        v-show="files.length === 0 || visibleFiles.length === 0"
        class="has-text-centered no-content"
      >{{ files.length ? $t('library.noMatches') : '' }}</div>
    </div>
    <div
      class="is-divider"
      :data-content="
        $t('list.total') + ' ' + visibleFiles.length + ' / ' + files.length + ' ' + $t('list.item')
      "
    ></div>
    <readmemd
      :option="readmemd"
      v-if="renderReadMeMD && readmemd.display"
    ></readmemd>

    <viewer
      v-if="viewer && images && images.length > 0"
      :images="images"
      class="is-hidden"
      ref="viewer"
      :options="{ toolbar: true, url: 'data-source' }"
      @inited="inited"
    >
      <img
        v-for="image in images"
        :src="thum(image.thumbnailLink)"
        :data-source="image.path"
        :key="image.path"
        :alt="image.name"
        class="image"
      />
    </viewer>
  </div>
</template>

<script>
import {
  formatDate,
  formatFileSize,
  checkoutPath,
  checkView,
  checkExtends,
} from "@utils/AcrouUtil";
import { mapState, mapActions } from "vuex";
import BreadCrumb from "../common/BreadCrumb";
import ListView from "./components/list";
import GridView from "./components/grid";
import Markdown from "../common/Markdown";
import InfiniteLoading from "vue-infinite-loading";
import { addRecent, getLibrary, toggleFavorite } from "@/libs/util.library";
export default {
  name: "GoList",
  components: {
    BreadCrumb,
    ListView,
    GridView,
    Headmd: Markdown,
    Readmemd: Markdown,
    InfiniteLoading,
  },
  data: function() {
    const libraryOptions =
      (window.themeOptions && window.themeOptions.library) || {};
    const maxRecent = Number(libraryOptions.max_recent);
    return {
      infiniteId: +new Date(),
      loading: true,
      page: {
        page_token: null,
        page_index: 0,
      },
      files: [],
      filterQuery: "",
      filterType: libraryOptions.default_filter || "all",
      sortBy: libraryOptions.default_sort || "name-asc",
      favoritesOnly: false,
      favorites: [],
      recentFiles: [],
      libraryMenuOpen: !!libraryOptions.menu_default_open,
      enableLibrary: libraryOptions.enable !== false,
      maxRecent: maxRecent > 0 ? maxRecent : 12,
      libraryStorageKey: libraryOptions.storage_key || "go2index-library",
      viewer: false,
      icon: {
        "application/vnd.google-apps.folder": "icon-folder",
        "video/mp4": "icon-mp4",
        "video/x-matroska": "icon-mkv",
        "video/x-msvideo": "icon-avi",
        "video/webm": "icon-webm",
        "video/x-flv": "icon-video",
        "application/x-mpegURL": "icon-video",
        "audio/mpegurl": "icon-video",
        "audio/mp3": "icon-audio",
        "audio/flac": "icon-audio",
        "audio/x-m4a": "icon-audio",
        "audio/wav": "icon-audio",
        "audio/ogg": "icon-audio",
        "text/plain": "icon-txt",
        "text/markdown": "icon-markdown",
        "text/x-ssa": "icon-ass",
        "text/html": "icon-html",
        "text/x-python-script": "icon-python",
        "text/x-java": "icon-java",
        "text/x-sh": "icon-sh",
        "application/x-subrip": "icon-srt",
        "application/zip": "icon-zip",
        "application/x-zip-compressed": "icon-zip",
        "application/rar": "icon-rar",
        "application/pdf": "icon-pdf",
        "application/json": "icon-json",
        "application/x-yaml": "icon-yml",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "icon-word",
        "application/vnd.android.package-archive": "icon-app",
        "application/x-msdownload": "icon-exe",
        "application/x-apple-diskimage": "icon-dmg",
        "application/vnd.google-apps.shortcut": "icon-link",
        "image/bmp": "icon-img",
        "image/jpeg": "icon-img",
        "image/png": "icon-img",
        "image/gif": "icon-img",
      },
      headmd: { display: false, file: {}, path: "" },
      readmemd: { display: false, file: {}, path: "" },
    };
  },
  computed: {
    ...mapState("acrou/view", ["mode"]),
    images() {
      return this.visibleFiles.filter((file) =>
        file.mimeType.startsWith("image/")
      );
    },
    visibleFiles() {
      const query = this.filterQuery.toLocaleLowerCase();
      return this.files
        .filter((file) => {
          const name = (file.name || "").toLocaleLowerCase();
          return !query || name.includes(query);
        })
        .filter(
          (file) =>
            this.filterType === "all" ||
            this.getFileType(file) === this.filterType
        )
        .filter((file) => !this.favoritesOnly || this.isFavorite(file))
        .slice()
        .sort(this.compareFiles);
    },
    renderHeadMD() {
      return window.themeOptions.render.head_md || false;
    },
    renderReadMeMD() {
      return window.themeOptions.render.readme_md || false;
    },
    isSearchPage() {
      return this.$route.params.cmd === "search";
    },
  },
  created() {
    if (this.enableLibrary) {
      this.loadLibrary();
    }
    this.render();
  },
  methods: {
    ...mapActions("acrou/aplayer", ["add"]),
    ...mapActions("acrou/db", ["set"]),
    infiniteHandler($state) {
      // 首次进入页面不执行滚动事件
      if (!this.page.page_token) {
        return;
      }
      this.page.page_index++;
      this.render($state);
    },
    render($state) {
      this.headmd = { display: false, file: {}, path: "" };
      this.readmemd = { display: false, file: {}, path: "" };
      var path = this.$route.path;
      var password = localStorage.getItem("password" + path);
      let q = this.$route.query.q;
      var p = {
        q: q ? decodeURIComponent(q) : "",
        password: password || null,
        ...this.page,
      };
      return this.axios
        .post(path, p)
        .then((res) => {
          var body = res.data;
          if (body) {
            // 判断响应状态
            if (body.error && body.error.code == "401") {
              this.checkPassword(path);
              return;
            }
            var data = body.data;
            if (!data) return;
            this.page = {
              page_token: body.nextPageToken,
              page_index: body.curPageIndex,
            };
            if ($state) {
              this.files.push(...this.buildFiles(data.files));
            } else {
              this.files = this.buildFiles(data.files);
            }
            if (data.files) {
              this.renderMd(data.files, path);
            }
          }
          if (this.$refs.infinite && this.$refs.infinite.stateChanger) {
            if (body.nextPageToken) {
              this.$refs.infinite.stateChanger.loaded();
            } else {
              this.$refs.infinite.stateChanger.complete();
            }
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    buildFiles(files) {
      var path = this.$route.path;
      return !files
        ? []
        : files
            .map((item) => {
              var p = path + checkoutPath(item.name, item);
              let isFolder =
                item.mimeType === "application/vnd.google-apps.folder";
              let size = isFolder ? "-" : formatFileSize(item.size);
              return {
                path: p,
                ...item,
                modifiedTime: formatDate(item.modifiedTime),
                modifiedTimestamp: new Date(item.modifiedTime).getTime() || 0,
                size: size,
                sizeValue: Number(item.size) || 0,
                isFolder: isFolder,
              };
            });
    },
    checkPassword(path) {
      this.$prompt(this.$t("list.auth"), this.$t("notify.title"), {
        confirmButtonText: this.$t("common.confirm"),
        cancelButtonText: this.$t("common.cancel"),
        inputType: "password",
      })
        .then(({ value }) => {
          localStorage.setItem("password" + path, value);
          this.render();
        })
        .catch(() => {
          this.$router.go(-1);
        });
    },
    copy(path) {
      let origin = window.location.origin;
      path = origin + encodeURI(path);
      this.$copyText(path);
    },
    thum(url) {
      return url ? `/${this.$route.params.id}:view?url=${url}` : "";
    },
    inited(viewer) {
      this.$viewer = viewer;
    },
    action(file, target, isSearch = true) {
      const actionTarget = target || "";
      // Shortcut cannot be opened or downloaded directly
      const isShortcut = file.mimeType === "application/vnd.google-apps.shortcut";
      if (
        isShortcut &&
        (actionTarget === "down" ||
          actionTarget === "view" ||
          actionTarget === "_blank")
      ) {
        this.$notify({
          title: "notify.title",
          message: "error.shortcut_not_down",
          type: "warning",
        });
        return;
      }

      let cmd = this.$route.params.cmd;
      if (cmd && cmd === "search" && isSearch) {
        this.goSearchResult(file, actionTarget);
        return;
      }

      const canTrackRecent =
        ["", "view", "down", "_blank"].indexOf(actionTarget) > -1;
      if (canTrackRecent && this.enableLibrary) {
        this.trackRecent(file);
      }

      if (file.mimeType.startsWith("image/") && actionTarget === "view") {
        this.viewer = true;
        this.$nextTick(() => {
          let index = this.images.findIndex((item) => item.path === file.path);
          this.$viewer.view(index);
        });
        return;
      }
      if (
        file.mimeType.startsWith("audio/") &&
        file.mimeType.indexOf("mpegurl") == -1 &&
        actionTarget === "view"
      ) {
        if (window.aplayer) {
          this.add({
            audio: {
              id: file.id,
              name: file.name,
              artist: "none",
              url: file.path,
            },
            play: true,
          });
        }
        return;
      }
      this.target(file, actionTarget);
    },
    target(file, target) {
      let path = file.path;
      if (target === "rename") {
        this.renameItem(file);
        return;
      }
      if (target === "move") {
        this.moveItem(file);
        return;
      }
      if (target === "delete") {
        this.deleteItem(file);
        return;
      }
      if (target === "_blank") {
        window.open(path);
        return;
      }
      if (target === "copy") {
        this.copy(path);
        return;
      }
      if (target === "down" || (!checkExtends(path) && !file.isFolder)) {
        location.href = path.replace(/^\/(\d+:)\//, "/$1down/");
        return;
      }
      if (target === "view") {
        let checkViewPath = checkView(path);
        this.set({
          path: `page.${checkViewPath}`,
          value: file,
        });
        this.$router.push({
          path: checkViewPath,
        });
        return;
      }
      if (file.mimeType === "application/vnd.google-apps.folder") {
        this.$router.push({
          path: path,
        });
        return;
      }
    },
    getDriveCommandPath(command) {
      return `/${this.$route.params.id}:${command}`;
    },
    toRelativePath(path) {
      return (path || "/").replace(/^\/\d+:/, "") || "/";
    },
    normalizeFolderPath(path = "/") {
      let normalized = path || "/";
      if (normalized[0] !== "/") normalized = "/" + normalized;
      if (normalized[normalized.length - 1] !== "/") normalized += "/";
      return normalized;
    },
    getCurrentFolderPath() {
      return this.normalizeFolderPath(this.toRelativePath(this.$route.path));
    },
    normalizeTargetFolderInput(input) {
      const trimmed = (input || "").trim();
      if (!trimmed) return null;
      if (trimmed === ".") return this.getCurrentFolderPath();
      if (trimmed === "..") {
        const current = this.getCurrentFolderPath().replace(/\/$/, "");
        const index = current.lastIndexOf("/");
        return this.normalizeFolderPath(current.slice(0, index + 1) || "/");
      }
      if (trimmed.startsWith("/")) {
        return this.normalizeFolderPath(trimmed);
      }
      return this.normalizeFolderPath(this.getCurrentFolderPath() + trimmed);
    },
    async runFileCommand(command, payload, successMessage) {
      this.loading = true;
      try {
        await this.axios.post(this.getDriveCommandPath(command), payload);
        this.$notify({
          title: "notify.title",
          message: successMessage,
          type: "success",
        });
        await this.reloadList();
      } catch (error) {
        this.loading = false;
        console.log(error);
        this.$notify({
          title: "notify.title",
          message: "list.action.operationFailed",
          type: "error",
        });
      }
    },
    async reloadList() {
      this.page = {
        page_token: null,
        page_index: 0,
      };
      this.files = [];
      this.loading = true;
      await this.render();
    },
    createFolder() {
      this.$prompt(
        this.$t("list.action.createFolderPrompt"),
        this.$t("list.action.createFolder"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          inputValidator: (value) => !!(value && value.trim()),
          inputErrorMessage: this.$t("list.action.nameRequired"),
        }
      )
        .then(({ value }) => {
          this.runFileCommand(
            "mkdir",
            {
              name: value.trim(),
              parent_path: this.getCurrentFolderPath(),
            },
            "list.action.createFolderSuccess"
          );
        })
        .catch(() => {});
    },
    renameItem(file) {
      this.$prompt(
        this.$t("list.action.renamePrompt"),
        this.$t("list.opt.rename"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          inputValue: file.name,
          inputValidator: (value) => !!(value && value.trim()),
          inputErrorMessage: this.$t("list.action.nameRequired"),
        }
      )
        .then(({ value }) => {
          const newName = value.trim();
          if (newName === file.name) return;
          this.runFileCommand(
            "rename",
            {
              id: file.id,
              new_name: newName,
            },
            "list.action.renameSuccess"
          );
        })
        .catch(() => {});
    },
    moveItem(file) {
      this.$prompt(
        this.$t("list.action.movePrompt"),
        this.$t("list.opt.move"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          inputValue: this.getCurrentFolderPath(),
        }
      )
        .then(({ value }) => {
          const targetPath = this.normalizeTargetFolderInput(value);
          if (!targetPath) {
            this.$notify({
              title: "notify.title",
              message: "list.action.invalidTargetPath",
              type: "warning",
            });
            return;
          }
          this.runFileCommand(
            "move",
            {
              id: file.id,
              target_path: targetPath,
            },
            "list.action.moveSuccess"
          );
        })
        .catch(() => {});
    },
    deleteItem(file) {
      this.$confirm(
        this.$t("list.action.deleteConfirm", { name: file.name }),
        this.$t("list.opt.delete"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          type: "warning",
        }
      )
        .then(() => {
          this.runFileCommand(
            "delete",
            {
              id: file.id,
            },
            "list.action.deleteSuccess"
          );
        })
        .catch(() => {});
    },
    renderMd(files, path) {
      var cmd = this.$route.params.cmd;
      if (cmd) {
        return;
      }
      files.forEach((item) => {
        // HEAD.md
        if (item.name === "HEAD.md") {
          this.headmd = {
            display: true,
            file: item,
            path: path + item.name,
          };
        }
        // REDEME.md
        if (item.name === "README.md") {
          this.readmemd = {
            display: true,
            file: item,
            path: path + item.name,
          };
        }
      });
    },
    goSearchResult(file, target) {
      this.loading = true;
      this.resolveSearchResult(file)
        .then((resolvedFile) => {
          this.loading = false;
          if (resolvedFile) {
            this.action(resolvedFile, target, false);
          }
        })
        .catch((e) => {
          this.loading = false;
          console.log(e);
        });
    },
    resolveSearchResult(file) {
      const driveId = this.$route.params.id;
      return this.axios
        .post(`/${driveId}:id2path`, { id: file.id })
        .then((res) => {
          if (!res.data) return null;
          return {
            ...file,
            path: `/${driveId}:${res.data}`,
          };
        });
    },
    getIcon(type) {
      return "#" + (this.icon[type] ? this.icon[type] : "icon-file");
    },
    getFileType(file) {
      const mimeType = file.mimeType || "";
      const name = (file.name || "").toLocaleLowerCase();
      if (file.isFolder) return "folder";
      if (mimeType.startsWith("image/")) return "image";
      if (mimeType.startsWith("video/")) return "video";
      if (mimeType.startsWith("audio/")) return "audio";
      if (
        /zip|rar|7z|tar|gzip/.test(mimeType) ||
        /\.(zip|rar|7z|tar|gz)$/i.test(name)
      )
        return "archive";
      return "document";
    },
    compareFiles(first, second) {
      if (first.isFolder !== second.isFolder) return first.isFolder ? -1 : 1;
      const [field, direction] = this.sortBy.split("-");
      let result = 0;
      if (field === "name") result = first.name.localeCompare(second.name);
      if (field === "modified")
        result = first.modifiedTimestamp - second.modifiedTimestamp;
      if (field === "size") result = first.sizeValue - second.sizeValue;
      return direction === "desc" ? -result : result;
    },
    loadLibrary() {
      const library = getLibrary(this.libraryStorageKey);
      this.favorites = library.favorites;
      this.recentFiles = library.recent;
    },
    isFavorite(file) {
      return this.favorites.some(
        (favorite) =>
          favorite.path === file.path ||
          (file.id && favorite.id && favorite.id === file.id)
      );
    },
    toggleFavorite(file) {
      if (!this.enableLibrary) {
        return;
      }
      if (this.$route.params.cmd === "search") {
        this.loading = true;
        this.resolveSearchResult(file)
          .then((resolvedFile) => {
            this.loading = false;
            if (resolvedFile) {
              this.favorites = toggleFavorite(
                resolvedFile,
                this.libraryStorageKey
              );
            }
          })
          .catch((error) => {
            this.loading = false;
            console.log(error);
          });
        return;
      }
      this.favorites = toggleFavorite(file, this.libraryStorageKey);
    },
    trackRecent(file) {
      this.recentFiles = addRecent(
        file,
        this.maxRecent,
        this.libraryStorageKey
      );
    },
    toggleLibraryMenu() {
      this.libraryMenuOpen = !this.libraryMenuOpen;
    },
    openStoredFile(file) {
      this.libraryMenuOpen = false;
      const target = file.isFolder
        ? ""
        : file.mimeType.startsWith("image/")
        ? "_blank"
        : "view";
      this.action(file, target, false);
    },
  },
};
</script>
<style lang="scss" scoped>
.g2-library-toolbar {
  margin: 1rem 0;
}
.g2-action-toolbar {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0 0.5rem;
}
.g2-library-toolbar .field {
  margin-bottom: 0.5rem;
}
.g2-library-menu {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  margin-bottom: 1rem;
  background: var(--g2-surface);
  border: 1px solid var(--g2-border);
  border-radius: var(--g2-radius);
  box-shadow: var(--g2-shadow);
}
.g2-library-section {
  display: flex;
  flex: 1 1 15rem;
  flex-direction: column;
  min-width: 0;
}
.g2-library-item {
  justify-content: flex-start;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: var(--g2-radius-sm);
  transition: background-color var(--g2-transition), color var(--g2-transition);

  &:hover {
    background: var(--g2-primary-light);
    color: var(--g2-primary-dark);
  }
}
.g2-library-item .fa {
  width: 1.5rem;
  color: #f5a623;
}
</style>
