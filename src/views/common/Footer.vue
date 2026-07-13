<template>
  <footer class="footer g2-footer">
    <div class="columns is-mobile is-centered">
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <a
            class="g2-footer-badge"
            href="https://github.com/lrpli/goindex-theme-acrou"
            target="_blank"
            rel="noopener"
          >
            <span class="g2-footer-badge-name">codex-drive-nebula</span>
            <span class="g2-footer-badge-meta">
              <i class="fa fa-github" aria-hidden="true"></i>
              MIT
            </span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  props: {},
  watch: {},
  data: function () {
    return {
      content: ""
    };
  },
  components: {},
  methods: {}
};
</script>
<style lang="scss" scoped>
.g2-footer {
  padding: 1.5rem 1rem 2.5rem;
}
.g2-footer-badge {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--g2-border);
  border-radius: 999px;
  box-shadow: var(--g2-shadow-sm);
  transition: box-shadow var(--g2-transition), transform var(--g2-transition),
    border-color var(--g2-transition);

  &:hover {
    box-shadow: var(--g2-shadow);
    transform: translateY(-1px);
    border-color: var(--g2-primary-soft);
  }
}
.g2-footer-badge-name {
  padding: 0.4rem 0.85rem;
  background: linear-gradient(120deg, var(--g2-navbar-from), var(--g2-navbar-to));
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.g2-footer-badge-meta {
  padding: 0.4rem 0.85rem;
  background: var(--g2-surface);
  color: var(--g2-text-light);
  font-size: 0.75rem;

  .fa {
    margin-right: 0.3rem;
  }
}
</style>
