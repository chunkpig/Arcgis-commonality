import store from "../store/index";
let utils = {};
var getMap = store.state.MapObj;
var targetGoTo; //获取地块基本信息
var areaModel = "";
var PolygonGraphic = "";
var areatices = [];
var areagraph = "";
var smallgeometry = {};
utils.install = function(Vue, opt) {
  //地图打点
  Vue.prototype.ArcgisDot = function(net, title, path) {
    let symbol = new getMap.obj.PictureMarkerSymbol(path, 13, 13);
    let point = new getMap.obj.Point(
      net[0],
      net[1],
      new getMap.obj.SpatialReference({
        wkid: 4326
      })
    );
    let attr = {
      imei: title, //存放点位基本信息
      element: targetGoTo //存放地块的基本信息
    };
    let g = new getMap.obj.Graphic(point, symbol, attr);
    getMap.obj.view.graphics.add(g);
  };
  //地图画地块
  Vue.prototype.ArcgisPolygon = function(element, arr) {
    let polylineAtt = {
      title: element,
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
    let GraphicsLayer = new getMap.obj.GraphicsLayer();
    GraphicsLayer.add(graphic);
    getMap.obj.map.add(GraphicsLayer);
    targetGoTo = graphic;
    /**
     * 把生成地块的graphic内容传给点位信息坐标里，点击点位的时候获取地块的基本属性
     * 使用goto方法里面的target属性，可以使点击后的自动缩放适合的比例
     * 如不需要这个可不使用
     */
    return targetGoTo;
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
    let GraphicsLayer = new getMap.obj.GraphicsLayer();
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
      drawMoving(0, 1, arry[i].paths, moveLayer);
    }
    getMap.obj.map.add(GraphicsLayer);
  };
  function drawMoving(startIndex, stopIndex, paths, moveLayer, graphic) {
    let endIndex = paths.length;
    if (stopIndex < endIndex) {
      let startX = paths[startIndex][0];
      let startY = paths[startIndex][1];
      let stopX = paths[stopIndex][0];
      let stopY = paths[stopIndex][1];
      console.log(startX);
      //斜率
      let p = (stopY - startY) / (stopX - startX);

      //偏移量
      let v = 0.00005;
      console.log(graphic);
      if (!graphic) {
        console.log(graphic);
        var people = {
          type: "point",
          longitude: startX,
          latitude: startY
        };
        console.log(people);
        var peopleSimpleMark = {
          type: "picture-marker",
          url: "../assets/img/red_c1.png",
          width: 24,
          height: 24
        };
        graphic = new getMap.obj.Graphic({
          geometry: people,
          symbol: peopleSimpleMark
        });
        console.log(graphic);
      }
      //定时器
      let moving = setInterval(function() {
        // debugger;
        // 起点下标
        let startNum = startIndex;
        // 终点下标
        let stopNum = stopIndex;
        let newX, newY;
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
        if (
          (graphic.geometry.x - stopX) * (newX - stopX) > 0 ||
          (graphic.geometry.y - stopY) * (newY - stopY) > 0
        ) {
          // 可以开始下一段轨迹移动
          graphic.geometry.x = stopX;
          graphic.geometry.y = stopY;
          clearInterval(moving);
          startIndex++;
          stopIndex++;
          if (stopNum < endIndex) {
            console.log(`第${startIndex}步`);
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
              url: "../assets/img/red_c1.png",
              width: 32,
              height: 32
            };
            graphic = new getMap.obj.Graphic({
              geometry: people,
              symbol: peopleSimpleMark
            });
            moveLayer.graphics = [graphic];
          }
        }
      }, 3000);
    }
  }
};

export default utils;
