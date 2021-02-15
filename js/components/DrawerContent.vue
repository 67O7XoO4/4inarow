<template>

    <div>

      <md-toolbar class="md-transparent" md-elevation="0">
        <span class="md-title">{{ $t("title") }}</span>
      </md-toolbar>

      <md-list>

        <md-list-item>
          <md-field>
            <label for="lang">{{ $t("chooseLang") }}</label>
            <md-select id="lang" v-model="settings.lang">
              <md-option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang">{{ lang }}</md-option>
            </md-select>
          </md-field>
        </md-list-item>

        <md-list-item>
          <md-switch v-model="settings.timerEnabled">{{ $t("useTimer") }}</md-switch>
        </md-list-item>

        <md-list-item>
            <md-field>
            <label for="nbColumns">{{ $t("nbColumns") }}</label>
            <md-select id="nbColumns" md-dense v-model="settings.board.nbColumns" :disabled="disabled" >
              <md-option  v-for="i in [3,4,5,6,7,8,9]"  :value="i" :key="i" :disabled=" settings.board.nbCellsToWin > Math.max(settings.board.nbRows, i)">
                {{ i }} <span v-if="i==7" class="md-caption"> (standard)</span>
              </md-option>
            </md-select>
            <span class="md-helper-text" v-if="disabled">{{ $t("CantChangeSettings")}}</span>
          </md-field>
        </md-list-item>

        <md-list-item>
          <md-field>
            <label for="nbRows">{{ $t("nbRows") }}</label>
            <md-select id="nbRows" md-dense v-model="settings.board.nbRows" :disabled="disabled">
              <md-option  v-for="i in [3,4,5,6,7,8,9]"  :value="i" :key="i" :disabled=" settings.board.nbCellsToWin > Math.max(i, settings.board.nbColumns)">
                {{ i }}<span v-if="i==6" class="md-caption"> (standard)</span> 
            </md-option>
            </md-select>
            <span class="md-helper-text" v-if="disabled">{{ $t("CantChangeSettings")}}</span>
          </md-field>
        </md-list-item>

        <md-list-item>
        <md-field>
          <label for="nbCellsToWin">{{ $t("nbCellsToWin") }}</label>
          <md-select id="nbCellsToWin" md-dense v-model="settings.board.nbCellsToWin" :disabled="disabled">
            <md-option  v-for="i in [3,4,5,6,7]"  :value="i" :key="i"  :disabled=" i > Math.max(settings.board.nbRows, settings.board.nbColumns)">
              {{ i }} <span v-if="i==4" class="md-caption"> (standard)</span>
            </md-option>
          </md-select>
          <span class="md-helper-text" v-if="disabled">{{ $t("CantChangeSettings")}}</span>
        </md-field>
      </md-list-item>
    </md-list>

    </div>
</template>


<script>

import i18n from '../i18n/I18n.js';

  export default{
    data: () => ({
      langs           : i18n.availableLocales,
      menu: {  show : false},
     }),
    props: ['settings', 'disabled'],

    // methods: {
    //   disabled{
    //     return game.isBeingPlayed() ;
    //   },
    // }
  }
</script>


<style>
</style>