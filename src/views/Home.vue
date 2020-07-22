<template>
  <div id="home">
    <MapView @getMap="getMap"></MapView>
    <div class="painting" @click="painting">绘画</div>
    <div class="drawing" @click="drawing">绘画信息</div>
    <div class="track" @click="track">轨迹</div>
    <div class="clear" @click="arcgisclear">清除</div>
    <div class="print" @click="print">打印</div>
  </div>
</template>

<script>
import MapView from "../components/MapView"; //加载arcgis地图组件

export default {
  name: "home",
  components: { MapView },
  data() {
    return {
      view: "",
      pointArr: [], //返回点位信息，用于清除
      parcel: {} //返回地块信息，用于清除
    };
  },
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  computed: {},
  mounted() {},
  //方法集合
  methods: {
    getMap(vl) {
      // console.log(vl);
      this.view = vl.view;
      this.init();
      this.view.on(["click"], this.initIdentify);
    },
    //添加点位
    init() {
      let title = [
        {
          ime: "测试",
          arr: [105.11398000000003, 37.32600000000008],
          path: require("../assets/img/red_c1.png")
        },
        {
          ime: "测试",
          arr: [105.19597007995483, 37.33902277370039],
          path: require("../assets/img/red_c1.png")
        }
      ];
      let element = [
        {
          city: "中卫市",
          county: "沙坡头区",
          dateTime: "2020-06-01 17:38:16",
          fieldType: "2",
          guid: "sadkda-daighwf-aisdhoawogb-faadawfgjfgj",
          id: "sadkda-daighwf-aisdhoawogb-faadawfgjfgj",
          isNewRecord: false,
          path: require("../assets/img/red_c1.png"),
          location: "宁夏回族自治区中卫市沙坡头区",
          arr: [
            [105.11398000000003, 37.32600000000008],
            [105.12002000000012, 37.33102000000014],
            [105.12089000000014, 37.33320000000003],
            [105.11451999999997, 37.33466000000004],
            [105.11398000000003, 37.32600000000008]
          ]
        },
        {
          city: "中卫市",
          county: "沙坡头区",
          dateTime: "2020-06-01 17:38:16",
          fieldType: "2",
          guid: "sadkda-daighwf-aisdhoawogb-faadawfgjfgj",
          id: "sadkda-daighwf-aisdhoawogb-faadawfgjfgj",
          path: require("../assets/img/red_c1.png"),
          isNewRecord: false,
          location: "宁夏回族自治区中卫市沙坡头区",
          arr: [
            [105.19597007995483, 37.33902277370039],
            [105.24540855651728, 37.33738498153229],
            [105.24060203796259, 37.30598706352875],
            [105.19150688415405, 37.309810120002695]
          ]
        }
      ];

      this.parcel = this.ArcgisPolygon(element);
      // this.pointArr = this.ArcgisDot(title);
      console.log(this.parcel);
    },
    //地图点击事件
    initIdentify(evet) {
      let _this = this;
      console.log(evet);
      _this.view.hitTest(evet).then(function(res) {
        console.log(res);
        let results = res.results;
        //判断是否点击到添加的点位还是地图上
        if (results.length != 0) {
          _this.view.goTo({
            target: res.results[0].graphic.attributes.imei.geometry
          });
        } else {
          _this.view.goTo({
            center: [106.09723902667673, 37.38627379395521],
            zoom: 8
          });
        }
      });
    },
    //绘画
    painting() {
      let draw = this.ArcgisDraw();
      console.log(draw);
    },
    //绘画信息
    drawing() {
      let info = this.Arcgisinformation();
      console.log(info);
    },
    //轨迹
    track() {
      let arr2 = [
        {
          paths: [
            [105.34742213214406, 37.350256793899625],
            [105.41334010089403, 37.34370639093761],
            [105.4627785774565, 37.341522796293305],
            [105.5067238899565, 37.33933913815608],
            [105.50123072589398, 37.29565264393877],
            [105.50123072589398, 37.24756817988149],
            [105.49573756183148, 37.21476571378895],
            [105.39136744464403, 37.206015979525674],
            [105.30896998370658, 37.206015979525674]
          ]
        }
      ];
      let path = require("../assets/img/red_c1.png");

      this.ArcgisTrack(arr2, path);
    },
    //清除
    arcgisclear() {
      // this.Arcgisclear(this.pointArr);
      this.Arcgisclear(this.parcel.poin, this.parcel.polygon);
    },
    //打印
    print() {
      this.Arcgisprint();
    }
  }
};
</script>
<style lang="scss" scoped>
#home {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .painting,
  .drawing,
  .track,
  .clear,
  .print {
    position: absolute;
    width: 6%;
    top: 2%;
    border-radius: 4px;
    left: 2%;
    background: rgba(255, 255, 255, 0.6);
    z-index: 2;
    text-align: center;
    padding: 0.5% 0;
    cursor: pointer;
    &:hover {
      transition: all 0.3s;
      color: #fff;
      background: rgba(0, 0, 0, 0.6);
    }
  }
  .drawing {
    top: 8%;
  }
  .track {
    top: 14%;
  }
  .clear {
    top: 20%;
  }
  .print {
    top: 26%;
  }
}
</style>
