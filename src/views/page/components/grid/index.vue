<template>
  <div class="g2-grid-view">
    <div class="columns is-multiline">
      <div
        class="column is-one-quarter"
        v-for="(file, index) in folders"
        :key="'folder_' + index"
        @click="action(file, '')"
      >
        <div class="card g2-grid-view-card g2-grid-view-folder">
          <button
            class="g2-favorite-button"
            type="button"
            :title="$t('library.toggleFavorite')"
            :aria-label="$t('library.toggleFavorite')"
            @click.stop="toggleFavorite(file)"
          >
            <i
              class="fa"
              :class="isFavorite(file) ? 'fa-star has-text-warning' : 'fa-star-o'"
              aria-hidden="true"
            ></i>
          </button>
          <div class="media">
            <div class="content" :title="file.name">
              <svg class="iconfont" aria-hidden="true">
                <use :xlink:href="getIcon(file.mimeType)" />
              </svg>
              {{ file.name }}
            </div>
          </div>
          <div class="g2-grid-actions">
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.copy')"
              @click.stop="action(file, 'copy')"
            >
              <i class="fa fa-copy" aria-hidden="true"></i>
            </button>
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.rename')"
              @click.stop="action(file, 'rename')"
            >
              <i class="fa fa-pencil" aria-hidden="true"></i>
            </button>
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.move')"
              @click.stop="action(file, 'move')"
            >
              <i class="fa fa-arrows" aria-hidden="true"></i>
            </button>
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.delete')"
              @click.stop="action(file, 'delete')"
            >
              <i class="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="columns is-multiline">
      <div
        class="column is-one-quarter"
        v-for="(file, index) in files"
        :key="'file_' + index"
        @click="action(file, 'view')"
      >
        <div class="card g2-grid-view-card">
          <button
            class="g2-favorite-button"
            type="button"
            :title="$t('library.toggleFavorite')"
            :aria-label="$t('library.toggleFavorite')"
            @click.stop="toggleFavorite(file)"
          >
            <i
              class="fa"
              :class="isFavorite(file) ? 'fa-star has-text-warning' : 'fa-star-o'"
              aria-hidden="true"
            ></i>
          </button>
          <div
            :class="
              'card-image' +
                (file.mimeType.indexOf('video') != -1
                  ? ' g2-grid-view-play'
                  : '')
            "
          >
            <i></i>
            <figure class="image is-square">
              <img
                v-if="file.thumbnailLink"
                v-lazy="thum(file.thumbnailLink)"
                :alt="file.name"
              />
              <svg v-else class="file-icon iconfont" aria-hidden="true">
                <use :xlink:href="getIcon(file.mimeType)" />
              </svg>
            </figure>
          </div>
          <div class="media g2-grid-view-file">
            <div class="content" :title="file.name">
              <svg class="iconfont" aria-hidden="true">
                <use :xlink:href="getIcon(file.mimeType)" />
              </svg>
              {{ file.name }}
            </div>
          </div>
          <div class="g2-grid-actions">
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.copy')"
              @click.stop="action(file, 'copy')"
            >
              <i class="fa fa-copy" aria-hidden="true"></i>
            </button>
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.newTab')"
              @click.stop="action(file, '_blank')"
            >
              <i class="fa fa-external-link" aria-hidden="true"></i>
            </button>
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.download')"
              @click.stop="action(file, 'down')"
            >
              <i class="fa fa-download" aria-hidden="true"></i>
            </button>
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.rename')"
              @click.stop="action(file, 'rename')"
            >
              <i class="fa fa-pencil" aria-hidden="true"></i>
            </button>
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.move')"
              @click.stop="action(file, 'move')"
            >
              <i class="fa fa-arrows" aria-hidden="true"></i>
            </button>
            <button
              class="button is-white is-small"
              type="button"
              :title="$t('list.opt.delete')"
              @click.stop="action(file, 'delete')"
            >
              <i class="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GridView",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    getIcon: {
      type: Function,
    },
    action: {
      type: Function,
    },
    thum: {
      type: Function,
    },
    isFavorite: {
      type: Function,
    },
    toggleFavorite: {
      type: Function,
    },
  },
  data: function() {
    return {};
  },
  computed: {
    folders() {
      return this.data.filter((item) => item.isFolder);
    },
    files() {
      return this.data.filter((item) => !item.isFolder);
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.g2-grid-view {
  margin-bottom: 2rem;
}
.media-left {
  margin-right: 0.5rem;
}
.content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  font-size: 14px;
}
.column {
  cursor: pointer;
}
.g2-grid-view-card {
  position: relative;
  //   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  .card-image {
    img {
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }
    .file-icon {
      width: 64px;
      height: 64px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 0, 0, 0.05);
  }
  .g2-grid-view-file {
    .content {
      padding: 8px;
    }
  }
}
.g2-favorite-button {
  position: absolute;
  z-index: 11;
  top: 0.45rem;
  right: 0.45rem;
  width: 2rem;
  height: 2rem;
  padding: 0;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}
.g2-grid-view-folder {
  padding: 10px;
}
.g2-grid-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0 0.5rem 0.5rem;
}
.g2-grid-actions .button {
  min-width: 2rem;
  padding: 0.2rem 0.4rem;
}
.g2-grid-view-play {
  &:before {
    z-index: 10;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    content: "";
    background: rgba(0, 0, 0, 0.15);
    opacity: 1;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#33000000, endColorstr=#33000000);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  i {
    font-style: normal;
  }

  i:before {
    z-index: 10;
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    text-align: center;
    height: 0;
    color: hsla(0, 0%, 100%, 0.67);
    content: "\e6f6";
    font-size: 3rem;
    font-family: iconfont !important;
    line-height: 0;
  }
}
.iconfont {
  width: 1.5em;
  height: 1.5em;
  vertical-align: middle;
}
</style>
