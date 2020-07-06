<!--  -->
<template>
  <div id="mapview"></div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import { loadModules } from "esri-loader";
import { mapGetters, mapMutations, mapState } from "vuex";
export default {
  //name放入模板名,方便在其他地方引用
  name: "mapview",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: ["center", "zoom"],
  data() {
    //这里存放数据
    return {};
  },
  //监听属性 类似于data概念
  computed: {},
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.initMap();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  //方法集合
  methods: {
    ...mapMutations(["changeMap"]),
    initMap() {
      const options = {
        url:
          "http://125.74.27.183:8990/arcgis_js_v413_sdk/arcgis_js_api/library/4.13/init.js"
      };
      loadModules(
        [
          // 此处的组件按自己的需求加载
          "esri/Map", //存储、管理、覆盖 图层
          "esri/views/MapView", //显示Map实例的2D视图
          "esri/layers/TileLayer", //加载arcgis底图
          "esri/layers/MapImageLayer", //加载自定义地图服务
          "esri/layers/WebTileLayer", //加载天地图
          "esri/symbols/PictureMarkerSymbol", //地图添加图片
          "esri/geometry/Point", //定位添加点位坐标
          "esri/geometry/SpatialReference", //类型 如：4326
          "esri/Graphic", //图形存储器
          "esri/layers/GraphicsLayer", //添加多边形
          "esri/views/draw/Draw", //绘图功能
          "esri/geometry/support/webMercatorUtils", //坐标转换
          "esri/geometry/geometryEngine", //用于测试，测量和分析两个或多个2D几何之间的空间关系
          "esri/geometry/Polygon" //多边形
        ],
        options
      )
        .then(
          ([
            Map,
            MapView,
            TileLayer,
            MapImageLayer,
            WebTileLayer,
            PictureMarkerSymbol,
            Point,
            SpatialReference,
            Graphic,
            GraphicsLayer,
            Draw,
            webMercatorUtils,
            geometryEngine,
            Polygon
          ]) => {
            //加载宁夏边界
            var layer = new MapImageLayer({
              url:
                "http://222.75.164.172:6080/arcgis/rest/services/NXXZQ/XZQCountry/MapServer"
            });
            // arcgis 自带底图
            //   var mapTileLayer = new TileLayer({
            //     url:
            //       "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer"
            //   });

            //开始加载天地图
            var tiledLayer = new WebTileLayer({
              urlTemplate:
                "http://{subDomain}.tianditu.gov.cn/DataServer?T=img_w&x={col}&y={row}&l={level}&tk=62034eef39f9e6cee95345302b579aca",
              subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]
            });
            var tiledLayer_poi = new WebTileLayer({
              urlTemplate:
                "http://{subDomain}.tianditu.gov.cn/DataServer?T=cva_w&x={col}&y={row}&l={level}&tk=62034eef39f9e6cee95345302b579aca",
              subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]
            });
            var CatLayer = new WebTileLayer({
              urlTemplate:
                "http://{subDomain}.tianditu.gov.cn/DataServer?T=cia_w&x={col}&y={row}&l={level}&tk=62034eef39f9e6cee95345302b579aca",
              subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]
            });
            //结束
            var map = new Map({
              layers: [tiledLayer, tiledLayer_poi, CatLayer, layer]
            });
            var view = new MapView({
              container: "mapview",
              map: map,
              center: this.center || [106.09723902667673, 37.38627379395521],
              zoom: this.zoom || 9 // 显示地图的级别
            });
            //关闭arcgis logo和缩放按钮
            view.ui._removeComponents(["attribution"]);
            view.ui._removeComponents(["zoom"]);
            //在其他组件调用arcgis方法是传出api
            let _this = this;
            view.when(function() {
              let obj = {
                view: view, //map实例
                map: map, //图层管理
                PictureMarkerSymbol: PictureMarkerSymbol, //地图添加图片
                Point: Point, //点位坐标
                SpatialReference: SpatialReference, //类型
                Graphic: Graphic, //图形存储器
                GraphicsLayer: GraphicsLayer, //多边形
                Draw: Draw, //绘图功能
                webMercatorUtils: webMercatorUtils, //坐标转换
                geometryEngine: geometryEngine, //用于测试，测量和分析两个或多个2D几何之间的空间关系
                Polygon: Polygon //多边形
              };

              _this.changeMap(obj);
              _this.$emit("getMap", obj);
            });
          }
        )
        .catch(err => {
          console.log(err);
        });
    }
  },
  //监控data中的数据变化
  watch: {},
  //如果页面有keep-alive缓存功能，这个函数会触发
  activated() {}
};
</script>

<style scoped>
@import url("http://125.74.27.183:8990/arcgis_js_v413_sdk/arcgis_js_api/library/4.13/esri/themes/light/main.css");
#mapview {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
