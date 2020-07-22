import store from "../store/index";
let utils = {};
var getMap = store.state.MapObj;
var GraphicsLayer;
var areaModel = "";
var PolygonGraphic = "";
var areatices = [];
var areagraph = "";
var printDiv;
var smallgeometry = {};
utils.install = function(Vue, opt) {
  //地图打点
  Vue.prototype.ArcgisDot = function(title) {
    var Dot = [];
    for (let i = 0; i < title.length; i++) {
      let symbol = new getMap.obj.PictureMarkerSymbol(title[i].path, 13, 13);
      let point = new getMap.obj.Point(
        title[i].arr[0],
        title[i].arr[1],
        new getMap.obj.SpatialReference({
          wkid: 4326
        })
      );
      let attr = {
        imei: title[i] //存放点位基本信息
      };
      let g = new getMap.obj.Graphic(point, symbol, attr);
      Dot.push(g);
      getMap.obj.view.graphics.add(g);
    }
    return Dot;
  };
  //地图画地块
  Vue.prototype.ArcgisPolygon = function(element) {
    GraphicsLayer = new getMap.obj.GraphicsLayer();
    let parcel = {
      poin: [],
      polygon: []
    };
    for (let i = 0; i < element.length; i++) {
      let arr = element[i].arr;
      //start地块
      let polylineAtt = {
        title: element[i],
        center: arr[0]
      };
      let polygon = {
        type: "polygon", // autocasts as new Polygon()
        rings: arr
      };
      let fillSymbol = {
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        color: [170, 66, 77, 0.5],
        outline: {
          color: [255, 255, 255, 0.5],
          width: 1
        }
      };
      let graphic = new getMap.obj.Graphic({
        geometry: polygon,
        attributes: polylineAtt,
        symbol: fillSymbol
      });

      //end
      //start地块上的标志
      let symbol = new getMap.obj.PictureMarkerSymbol(element[i].path, 13, 13);
      let point = new getMap.obj.Point(
        element[i].arr[0][0],
        element[i].arr[0][1],
        new getMap.obj.SpatialReference({
          wkid: 4326
        })
      );
      let attr = {
        imei: graphic //存放点位基本信息
      };
      let g = new getMap.obj.Graphic(point, symbol, attr);
      getMap.obj.view.graphics.add(g);
      //end
      parcel.poin.push(g);
      parcel.polygon.push(graphic);
      GraphicsLayer.add(graphic);
      getMap.obj.map.add(GraphicsLayer);
    }
    return parcel;
  };
  //地图绘画
  Vue.prototype.ArcgisDraw = function() {
    let draw = new getMap.obj.Draw({
      view: getMap.obj.view
    });
    let action = draw.create("polygon");
    action.on("vertex-add", drawPolyArea);
    action.on("cursor-update", drawPolyArea);
    action.on("vertex-remove", drawPolyArea);
    action.on("draw-complete", drawPolyArea);
  };
  function drawPolyArea(evt) {
    areatices = [];
    areagraph = "";
    let vertices = evt.vertices;
    areatices = vertices;
    getMap.obj.view.graphics.remove(areaModel);
    getMap.obj.view.graphics.remove(PolygonGraphic);
    // 新建一个多边形
    let polygon = createPolygon(vertices);
    let graphic = createPolygonGraphic(polygon);
    PolygonGraphic = graphic;
    getMap.obj.view.graphics.add(graphic);
    /**
     * arcgis4.x 地图坐标系是3857，但常用的坐标系是4326
     * 这里需要抓换成4326坐标系的
     */
    smallgeometry = {};
    smallgeometry = getMap.obj.webMercatorUtils.webMercatorToGeographic(
      graphic.geometry
    );
    // 计算多边形的面积
    var area = getMap.obj.geometryEngine.geodesicArea(polygon, "acres");
    if (area < 0) {
      // 如果需要，简化多边形，再计算面积。
      var simplifiedPolygon = getMap.obj.geometryEngine.simplify(polygon);
      if (simplifiedPolygon) {
        area = getMap.obj.geometryEngine.geodesicArea(
          simplifiedPolygon,
          "acres"
        );
      }
    }
    area *= 6.07;
    areagraph = area.toFixed(3);
    // 开始显示多边形的面积
    labelText(polygon, area, "亩", smallgeometry);
  }
  //创建多边形
  function createPolygon(vertices) {
    return new getMap.obj.Polygon({
      rings: vertices,
      spatialReference: getMap.obj.view.spatialReference
    });
  }
  function createPolygonGraphic(polygon) {
    return new getMap.obj.Graphic({
      geometry: polygon,
      symbol: {
        type: "simple-fill", // autocasts as SimpleFillSymbol
        color: [255, 0, 0, 0.3],
        style: "solid",
        outline: {
          // autocasts as SimpleLineSymbol
          color: [255, 255, 0],
          width: 2
        }
      }
    });
  }
  //绘制标签文字
  function labelText(geom, area, type) {
    areaModel = new getMap.obj.Graphic({
      geometry: geom.centroid,
      symbol: {
        type: "text",
        color: "#fff",
        /*保留的小数位*/
        text: area.toFixed(3) + type,
        xoffset: 3,
        yoffset: 3,
        font: {
          // 自动字体
          size: 14,
          family: "sans-serif"
        }
      }
    });
    getMap.obj.view.graphics.add(areaModel);
  }
  //获取绘画后地块信息
  Vue.prototype.Arcgisinformation = function() {
    return smallgeometry;
  };
  //地图轨迹
  Vue.prototype.ArcgisTrack = function(arry, imgurl) {
    //传过来的数据必须是数组类型
    for (let i = 0; i < arry.length; i++) {
      //绘制起点
      let startPoint = arry[i].paths[0];
      let point1 = {
        type: "point",
        longitude: startPoint[0],
        latitude: startPoint[1]
      };
      let markerSymbol = {
        type: "picture-marker", // autocasts as new SimpleMarkerSymbol()
        url: imgurl,
        width: 16,
        height: 16
      };
      let startPointGraphic = new getMap.obj.Graphic({
        geometry: point1,
        symbol: markerSymbol
      });
      GraphicsLayer.add(startPointGraphic);
      //绘制终点
      let stopPoint = arry[i].paths[arry[i].paths.length - 1];
      let point2 = {
        type: "point",
        longitude: stopPoint[0],
        latitude: stopPoint[1]
      };
      let stopMarkerSymbol = {
        type: "picture-marker", // autocasts as new SimpleMarkerSymbol()
        url: imgurl,
        width: 16,
        height: 16
      };
      let stopPointGraphic = new getMap.obj.Graphic({
        geometry: point2,
        symbol: stopMarkerSymbol
      });
      GraphicsLayer.add(stopPointGraphic);
      //绘制转移路线
      let polyline = {
        type: "polyline",
        paths: arry[i].paths
      };
      let polylineSymbol = {
        type: "simple-line",
        color: [226, 119, 40],
        width: 4
      };
      let polylineGraphic = new getMap.obj.Graphic({
        geometry: polyline,
        symbol: polylineSymbol
      });
      let moveLayer = new getMap.obj.GraphicsLayer({
        id: "moveLayer_" + i
      });
      getMap.obj.map.add(moveLayer);
      GraphicsLayer.add(polylineGraphic);
      //加载移动标志

      drawMoving(0, 1, arry[i].paths, moveLayer);
    }
    getMap.obj.map.add(GraphicsLayer);
    let obj = {
      startPointGraphic: startPointGraphic,
      stopPointGraphic: stopPointGraphic
    };
  };
  //动态绘制移动轨迹
  var drawMoving = function(startIndex, stopIndex, paths, moveLayer, graphic) {
    let endIndex = paths.length;
    if (stopIndex < endIndex) {
      moveLayer.removeAll();
      let startX = paths[startIndex][0];
      let startY = paths[startIndex][1];
      let stopX = paths[stopIndex][0];
      let stopY = paths[stopIndex][1];
      //斜率
      let p = (stopY - startY) / (stopX - startX);
      //偏移量
      var people, peopleSimpleMark;
      let v = 0.00005;
      if (!graphic) {
        people = {
          type: "point",
          longitude: paths[startIndex][0],
          latitude: paths[startIndex][1]
        };
        peopleSimpleMark = {
          type: "picture-marker",
          url: require("../assets/img/yellow_2.png"),
          width: 24,
          height: 24
        };
        graphic = new getMap.obj.Graphic({
          geometry: people,
          symbol: peopleSimpleMark
        });
        moveLayer.add(graphic);
      } else {
        people = {
          type: "point",
          longitude: paths[startIndex][0],
          latitude: paths[startIndex][1]
        };
        peopleSimpleMark = {
          type: "picture-marker",
          url: require("../assets/img/yellow_2.png"),
          width: 24,
          height: 24
        };
        graphic = new getMap.obj.Graphic({
          geometry: people,
          symbol: peopleSimpleMark
        });
        moveLayer.add(graphic);
      }
      //定时器
      var moving = setInterval(function() {
        // debugger;
        // 起点下标
        var startNum = startIndex;
        // 终点下标
        var stopNum = stopIndex;
        var newX;
        var newY;
        // 分别计算x，y轴上的偏移后的坐标
        if (Math.abs(p) === Number.POSITIVE_INFINITY) {
          // 斜率的绝对值为无穷大，斜率不存在，即x轴方向上的偏移量为0
          stopY > startY
            ? (newY = graphic.geometry + v)
            : (newY = graphic.geometry - v);
          newX = graphic.geometry.x;
        } else {
          if (stopX < startX) {
            newX = graphic.geometry.x - (1 / Math.sqrt(1 + p * p)) * v;
            newY = graphic.geometry.y - (p / Math.sqrt(1 + p * p)) * v;
          } else {
            newX = graphic.geometry.x + (1 / Math.sqrt(1 + p * p)) * v;
            newY = graphic.geometry.y + (p / Math.sqrt(1 + p * p)) * v;
          }
        }
        // 判断是否开始进行下一段轨迹移动

        // if (
        //   (graphic.geometry.x - stopX) * (newX - stopX) < 0 ||
        //   (graphic.geometry.y - stopY) * (newY - stopY) < 0
        // ) {
        // 可以开始下一段轨迹移动
        graphic.geometry.x = stopX;
        graphic.geometry.y = stopY;
        clearInterval(moving);
        startIndex++;
        stopIndex++;
        if (stopNum < endIndex) {
          // console.log(`第${startIndex}步`);
          // console.log(graphic);
          drawMoving(startIndex, stopIndex, paths, moveLayer, graphic);
        } else {
          console.log(123);
          var people = {
            type: "point",
            longitude: newX,
            latitude: newY
          };
          var peopleSimpleMark = {
            type: "picture-marker",
            url: require("../assets/img/yellow_2.png"),
            width: 24,
            height: 24
          };
          graphic = new getMap.obj.Graphic({
            geometry: people,
            symbol: peopleSimpleMark
          });
          moveLayer.graphics = [graphic];
        }
        // }
      }, 300);
    }
  };
  //清除
  Vue.prototype.Arcgisclear = function(clearpoint, clearppolygon) {
    //start 点
    console.log(GraphicsLayer);
    for (let i = 0; i < clearpoint.length; i++) {
      getMap.obj.view.graphics.remove(clearpoint[i]);
      GraphicsLayer.remove(clearppolygon[i]);
    }
    //end
  };
  //打印
  Vue.prototype.Arcgisprint = function() {
    getMap.obj.view.ui.remove(printDiv);
    printDiv = new getMap.obj.Print({
      view: getMap.obj.view,
      printServiceUrl:
        "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
    });
    getMap.obj.view.ui.add(printDiv, {
      position: "top-right"
    });
  };
};

export default utils;
