<template>

  <md-card class="user-card"
           :class="{'md-elevation-6' : player.isCurrentPlayer, 'current-player' : player.isCurrentPlayer  }"
           :style="{'border-color' : player.color}">
    <md-card-header>
      <md-avatar :style="{'background-color' : player.color}">
        <md-icon v-if="player.isHuman() && ! player.isRemote()" :title="$t('playedByHumanTitle')" >person</md-icon>
        <md-icon v-if="player.isRemote()" :title="$t('playedRemoteTitle')">cloud</md-icon>
        <md-icon v-if="! player.isHuman()" :title="$t('playedByComputerTitle')" >computer</md-icon>
      </md-avatar> 
      
        <div class="md-title md-small-hide">{{player.name}}</div>
        <div v-if="player.isHuman()"  class="md-subhead md-small-hide" >{{$t('playedByHumanTitle')}}</div>
        <div v-if="! player.isHuman()" class="md-subhead md-small-hide">{{$t('playedByComputerTitle')}}</div>
        
      
    </md-card-header>

    <md-card-actions>
      
      <md-dialog  :md-active.sync="dialogSettings.show">
        <md-dialog-title>{{$t('settings')}}</md-dialog-title>
        <md-dialog-content>
          <md-field>
            <div class="md-subhead" v-if="player.isHuman()">{{$t('playedByHumanTitle')}}</div>
            <div class="md-subhead"  v-if=" ! player.isHuman()">{{$t('playedByComputerTitle')}}</div>
            <md-subheader>{{$t('changePlayerTypeTitle')}}</md-subheader>
            <md-switch id="changePlayerType" v-model="player.settings.isHuman" :title="$t('changePlayerTypeTitle')"></md-switch>
          </md-field>

          <md-list v-show="! player.isHuman()">
            <md-subheader>{{$t('depth')}}</md-subheader>
            <md-list-item v-for="i in [3,4,5,6,7,8]" :key="i" >
              <md-radio v-model="player.settings.level" :value="i"  />
              <span class="md-list-item-text"> {{ $t('level_' + i) }}</span>
              <md-badge class="md-primary" :md-content="i" :title="$t('level_' + i)" />
            </md-list-item>
          </md-list>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click="dialogSettings.show = false">{{ $t('close')}}</md-button>
        </md-dialog-actions>
      </md-dialog>

      <span v-if="player.isHuman() && player.timer.enabled">{{ formattedTimePassed }}</span>

      <md-chip class="md-primary"  v-if="! player.isHuman()"
              :title="$t('level_' + player.strategy.depth)">{{ player.strategy.depth }}</md-chip>
        

      <!-- settings -->
      <md-button @click="dialogSettings.show = true"
        :title="$t('playerSettingsTitle')"
        class="md-icon-button"
        v-if="displaySettings">
        <md-icon>settings</md-icon>
      </md-button>

      <!-- resume -->
      <md-button v-on:click="resume"  
        :title="$t('playerSuspendedTitle')"
        class="md-fab md-accent"
        v-if="! player.isHuman() && player.suspended">
        <md-icon>play_circle_outline</md-icon>
      </md-button>

      <!-- pause -->
      <md-button v-on:click="pause"  
        :title="$t('suspendPlayerTitle')"
        class="md-icon-button "
        v-if="! player.isHuman() && ! player.suspended">
        <md-icon>pause_circle_outline</md-icon>
      </md-button>
    </md-card-actions>
  </md-card>

</template>


<script>
  export default{
    data: () => ({
        dialogSettings : {show : false}
    }),
    props: ['player', 'display-settings'],
    
    computed :{
        formattedTimePassed() {
            const timePassed = this.player.timer.timePassed / 1000;
            let minutes = Math.floor(timePassed / 60);
            let seconds = Math.floor(timePassed % 60);
            if (minutes < 10) {
                minutes = `0${minutes}`;
            }
            if (seconds < 10) {
                seconds = `0${seconds}`;
            }
            return `${minutes}:${seconds}`;
          },

    },
    methods : {
        resume : function(){
            this.player.suspended = false;
            this.$emit('resume');
        },
        
        pause : function(){ 
            this.player.suspended = true;
            this.$emit('pause');
        },
    }    
  }
</script>


<style>

.md-card.user-card {
    max-width: 250px; 
    background: #ffffff;
}
.md-app-content .md-card.user-card {
    margin: 4px;
}
.md-card.user-card.current-player {
    border: solid 1px;  
}
</style>