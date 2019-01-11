## Basic Modal

Basic modal usage

You will need to add the portal-target to the end of your html body to get the modal working properly
```html
<!-- put the following tag as last element to your html body / layout -->
<!-- make sure you only include it once! -->
<portal-target name="modal" style="position: absolute" />
```

```
<template>
  <div>
    <ds-modal 
      v-model="isOpen"
      title="Modal Title" 
    >
      <p>Hello World</p>
    </ds-modal>
    <ds-button primary icon="rocket" @click="isOpen = true">Open Modal</ds-button>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        isOpen: false
      }
    }
  }
</script>
```

Customize button labels
```
<template>
  <div>
    <ds-modal 
      v-if="isOpen"
      v-model="isOpen"
      title="Custom Button Labels" 
      :allow-abort="false"
      confirm-label="All right"
      cancel-label="Please not"
    >
      <p>Culpa amet sunt aperiam ratione est sed. Molestiae minus doloremque libero. Beatae nam repellendus aliquid maxime.</p>
      <p>Sint quasi provident natus id earum debitis. Et facilis a iure ullam. Velit autem eveniet ea reprehenderit ducimus doloribus earum quo.</p>
      <p>Consequatur ratione repudiandae aliquid ea. Ut eum architecto assumenda. Autem eaque provident quia et.</p>
      <p>Eaque quia aut dolorum sunt ea consequuntur. Labore reprehenderit placeat pariatur molestiae sit laborum nostrum. Deserunt est commodi et suscipit tenetur ipsa voluptas cupiditate. Porro laborum quidem ut corrupti. Dolorum et est placeat qui.</p>
      <p>Adipisci beatae cumque esse harum. Error quis nulla illo nemo est. Enim est quis explicabo voluptatem. Omnis maxime qui similique consequatur voluptatibus. Est necessitatibus iure aliquid omnis eum. Ut voluptatibus vel error exercitationem temporibus qui expedita.</p>
    </ds-modal>
    <ds-button primary icon="rocket" @click="isOpen = true">Open Modal</ds-button>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        isOpen: false
      }
    }
  }
</script>
```
