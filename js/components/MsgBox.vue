<template>

  <div v-show="remoteManager.isConnected && remoteManager.getMsgHandler()"
        class="msg-box md-layout-item md-medium-size-100 md-large-size-66 md-xlarge-size-50">
    <div  class="msg-list">
      <div  v-for="msg in remoteManager.getMsgHandler().msgList" :class="{'msg-sent' : msg.type == 'sent', 'msg-received' : msg.type == 'received'}"  >{{ msg.msg }}</div>
    </div>
    <!-- send msg-->
    <md-field md-inline>
      <label>{{ $t("tapYourMessageHere") }}</label>
      <md-input type="text" v-model="remoteManager.getMsgHandler().msg"  
          @keyup.enter="remoteManager.getMsgHandler().sendMsg()" 
          ></md-input>
      <md-button  class="md-button md-icon-button md-dense md-input-action md-clear"
          @click="remoteManager.getMsgHandler().sendMsg()"
          :title="$t('sendMsg')" 
          >
        <md-icon>send</md-icon>
      </md-button>

    </md-field>
  </div>

</template>


<script>

  export default{

    props: ['remoteManager']
  }
</script>


<style>

.msg-box{
    min-height: 0;
} 

.msg-box .md-field .md-input{
    padding-right:36px
}

.msg-box .md-field {
    margin:0 
}

.msg-sent{
    text-align: right;
    color: gray;
    font-size: 12px;
}

.msg-received{
    text-align: left;
    color: black;
    font-size: 12px;
}

</style>