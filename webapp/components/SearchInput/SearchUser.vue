<template>
  <ds-flex-item class="search-option">
    <ds-avatar class="avatar" name="option.name" image="option.avatar" />
    <div>
      <ds-text class="userinfo">
        <b class="username">{{ option.name | truncate(70) }}</b>
      </ds-text>
    </div>
    <ds-text align="left" size="small" color="soft">@{{ option.slug | truncate(70) }}</ds-text>
  </ds-flex-item>
</template>
<script>
export default {
  name: 'SearchUser',
  props: {
    option: { type: Object, required: true },
  },
}
</script>
<style>
.avatar {
  display: inline-block;
  float: left;
  margin-right: 4px;
  height: 100%;
  vertical-align: middle;
}
.userinfo {
  display: flex;
  align-items: center;
  > .ds-text {
    display: flex;
    align-items: center;
    margin-left: $space-xx-small;
  }
}
.user {
  white-space: nowrap;
  position: relative;
  display: flex;
  align-items: center;
  &:hover,
  &.active {
    z-index: 999;
  }
}
.username {
  color: #17b53f;
}
</style>
