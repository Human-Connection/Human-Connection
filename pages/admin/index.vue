<template>
  <ds-card>
    <ds-space margin="large">
      <ds-flex>
        <ds-flex-item>
          <ds-number
            :count="3802 | number(0)"
            label="Users"
            size="x-large"
            uppercase />
        </ds-flex-item>
        <ds-flex-item>
          <ds-number
            :count="10491 | number(0)"
            label="Posts"
            size="x-large"
            uppercase />
        </ds-flex-item>
        <ds-flex-item>
          <ds-number
            :count="43644 | number(0)"
            label="Comments"
            size="x-large"
            uppercase />
        </ds-flex-item>
      </ds-flex>
    </ds-space>
    <ds-space margin="x-large">
      <ds-flex>
        <ds-flex-item>
          <ds-number
            :count="80046 | number(0)"
            label="Notifications"
            size="x-large"
            uppercase />
        </ds-flex-item>
        <ds-flex-item>
          <ds-number
            :count="273 | number(0)"
            label="Organization"
            size="x-large"
            uppercase />
        </ds-flex-item>
        <ds-flex-item>
          <ds-number
            :count="0 | number(0)"
            label="Projects"
            size="x-large"
            uppercase />
        </ds-flex-item>
      </ds-flex>
    </ds-space>
    <ds-space margin="x-large">
      <ds-flex>
        <ds-flex-item>
          <ds-number
            :count="2174 | number(0)"
            label="Open Invites"
            size="x-large"
            uppercase />
        </ds-flex-item>
        <ds-flex-item>
          <ds-number
            :count="1383 | number(0)"
            label="Follows"
            size="x-large"
            uppercase />
        </ds-flex-item>
        <ds-flex-item>
          <ds-number
            :count="27180 | number(0)"
            label="Shouts"
            size="x-large"
            uppercase />
        </ds-flex-item>
      </ds-flex>
    </ds-space>
  </ds-card>
</template>

<script>

