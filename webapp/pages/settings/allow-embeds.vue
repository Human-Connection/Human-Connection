<template>
  <div>
      <ds-card :header="$t('post.allowEmbeds.name')">

            <ds-container width="large">
      <ds-placeholder>
           <h3>{{ this.allowEmbeds_h3 }}</h3>
          <div>{{ this.allowEmbeds_desc }}</div>
        </ds-placeholder>
    </ds-container>

       <p>{{ $t('post.allowEmbeds.description') }}</p>
      <div>
          <ds-container>
              <ds-placeholder>
        <ds-list ordered>
            <ds-list-item>http://www.dailymotion.com</ds-list-item>
            <ds-list-item>https://www.facebook.com</ds-list-item>
            <ds-list-item>https://giphy.com</ds-list-item>
            <ds-list-item>https://www.flickr.com</ds-list-item>
            <ds-list-item>https://d.tube</ds-list-item>
            <ds-list-item>https://codepen.io</ds-list-item>
            <ds-list-item>http://www.meetup.com</ds-list-item>
            <ds-list-item>https://mixcloud.com</ds-list-item>
            <ds-list-item>https://reddit.com</ds-list-item>
            <ds-list-item>http://www.slideshare.net</ds-list-item> 
            <ds-list-item>http://soundcloud.com</ds-list-item>
            <ds-list-item>https://www.twitch.tv</ds-list-item>
            <ds-list-item>http://www.twitter.com</ds-list-item>
            <ds-list-item>https://vimeo.com</ds-list-item>
            <ds-list-item>https://www.youtube.com</ds-list-item>
        </ds-list>
        </ds-placeholder>
        </ds-container>
      </div>
      <p>{{ $t('post.allowEmbeds.statustext') }}</p>
      <div>  
    <ds-container width="large">
      <ds-placeholder>
           <h3>{{ this.allowEmbeds_h3 }}</h3>
          <div>{{ this.allowEmbeds_desc }}</div>
        </ds-placeholder>
    </ds-container>
     <p>{{ $t('post.allowEmbeds.statuschange') }}</p>
      <ds-button @click="toFalse" size="x-large">{{ $t('post.allowEmbeds.button-tofalse') }}</ds-button>
       <ds-button @click="toOnlySession" size="x-large">{{ $t('post.allowEmbeds.button-toonlysession') }}</ds-button>
        <ds-button @click="toTrue" size="x-large">{{ $t('post.allowEmbeds.button-totrue') }}</ds-button>
    </div>
   </ds-card>
  </div>

     

</template>

<script>
import json from '../assets/providers.json'

export default {
  data() {
    return {
        allowEmbeds_h3: this.$t('post.allowEmbeds.false'),
        allowEmbeds_desc: this.$t('post.allowEmbeds.third-party-false'),
    }
  },
  methods: {
    toFalse: function(){        
        this.allowEmbeds_h3 = this.$t('post.allowEmbeds.false')
        this.allowEmbeds_desc = this.$t('post.allowEmbeds.third-party-false')
      
    },
    toOnlySession: function(){
         
        this.allowEmbeds_h3 = this.$t('post.allowEmbeds.true')
        this.allowEmbeds_desc = this.$t('post.allowEmbeds.third-party-toonlysession')
    },
    toTrue: function(){
        this.allowEmbeds_h3 = this.$t('post.allowEmbeds.true')
        this.allowEmbeds_desc = this.$t('post.allowEmbeds.third-party-true')
    },
 
  fetchData(){
    
        console.log(json);
    
  }
},
  
}
</script>

<style lang="scss">
 
</style>
