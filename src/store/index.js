import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    MapObj: {
      obj: {}
    }
  },
  mutations: {
    changeMap(state, step) {
      state.MapObj.obj = step;
    }
  },
  actions: {},
  getters: {
    GetMapObj(state) {
      return state.MapObj.obj;
    }
  },
  modules: {}
});
