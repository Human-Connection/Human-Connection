<template>
  <ds-card space="small">
    <ds-heading tag="h3">User Images</ds-heading>
      <template>

  <ds-space :margin-bottom="{ base: 'small', md: 'base', lg: 'large' }">
       <div>
    <ds-button :secondary="blurTrueImages" @click="changeShowImages" >All Blur Images </ds-button>
    <ds-button :secondary="!blurTrueImages"  @click="changeShowImages" >All Images</ds-button>
  </div>
    </ds-space>
</template>
   <template v-if="hasResults">
  <div>
    <ds-grid gap="x-small"   >
      <ds-grid-item v-for="post in posts" :key="post.id" :row-span="10">
           <img            
           :src="postImage(post.image)" 
           @click="showImages(post)" style="width:100%"/>
          <div>{{post.createdAt}}</div>
          <a :href="'/post/'+ post.id" target="_blank">{{post.title}}</a>
          </ds-grid-item>
 
    </ds-grid>
  </div>
</template>


    <div>
    <ds-modal 
      v-if="isOpen"
      v-model="isOpen"
       :title="title" 
      force
      extended
      confirm-label="Ok"
      cancel-label="cancel"
    >
      <p>
           <img           
           :src="imagePath"           
           style="width:100%"/>
        <small>Dieses Bild ist vom User Blured</small>
          <div>
    <ds-button danger @click="deleteImage()"  >Bild löschen! </ds-button>
    <ds-button v-if="!blurTrueImages" secondary @click="moderatorBlurImage()"  > Bild unkenntlich machen! </ds-button>
     <a :href="contributionlink" target="_blank"><ds-button primary >Beitrag aufrufen </ds-button></a>
    
    
  </div>
      </p>
   
    </ds-modal>
  </div>
  </ds-card>


</template>




<script>
 import gql from 'graphql-tag'

 
export default {

  data() {
      return {
      posts: [],
      blurTrueImages: true,
      isOpen: false,
      imagePath: null,
      imageID: null,
      title: '',
      contributionlink: '',
    }
  },
   computed: {
    hasResults() {
      return this.$apollo.loading || (this.posts && this.posts.length > 0)
    },
  
},
 methods: {
    
     postImage(image) {
         // console.log("image1", image)
         // console.log("image.match('uploads/') ", image.match('uploads/') )
         if (image && image.match('uploads/') != null ) {
           // console.log("image ist API", image)
            return '/api' + image 
              
         } else {
             //  console.log("image ist LINK", image)
            return '' + image 
         }
     },
    changeShowImages(){
      console.log("this.blurTrueImages is", this.blurTrueImages) 
        if ( this.blurTrueImages ) {
            this.blurTrueImages = false
            this.loadBlurFalseImages()
        } else {
            this.blurTrueImages = true
            this.loadBlurTrueImages()
            
        }
        console.log("this.blurTrueImages new", this.blurTrueImages)    
    },
    showImages(post){
        console.log("showImages(post)", post)  
           console.log(" this.blurTrueImages",  this.blurTrueImages)  
           
         this.isOpen = true
        this.imagePath = this.postImage(post.image)       
        this.title = post.title
        this.contributionlink = '/post/'+ post.id
    },
    moderatorBlurImage(post){
       console.log("moderatorBlurImage(post)", post)  
    },
    deleteImage(id){
        if (this.imageID !== id) return
        console.log("DELETE IMAGE, austauschen mit einem hinweisbild durch die moderation", id)
    },
      loadBlurFalseImages() {
         
      this.$apollo
        .query({
          query: gql`
           query {
          Post(blurImage: false){id, title, blurImage, image, imageUpload, createdAt }
        } 
          `,
        })
        .then(({ data: { Post } }) => {
         this.posts = Post
        })
    },
     loadBlurTrueImages() {
         
      this.$apollo
        .query({
          query: gql`
           query {
          Post(blurImage: true){id, title, blurImage, image, imageUpload, createdAt }
        } 
          `,
        })
        .then(({ data: { Post } }) => {
         this.posts = Post
        })
    },
 },
 apollo: {
    Post: {
      query() {
        return gql`
       query {
          Post(blurImage: true){id, title, blurImage, image, imageUpload, createdAt }
        }        `
      },   
      result({ data: { Post } }) {
        this.posts = Post
      },
    },
     },
}


</script>
