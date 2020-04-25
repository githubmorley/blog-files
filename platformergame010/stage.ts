const {ccclass, property} = cc._decorator;

@ccclass
export default class Stage extends cc.Component { // クラス名をNewClassからStageにする

    tiledMap: cc.TiledMap = null; // タイルマップ
    tiledMapSize: cc.Size = null; // タイルマップのサイズ
    start () {
        this.tiledMap = this.getComponent(cc.TiledMap); // stageノードの『TiledMap』コンポーネントを取得
        this.tiledMapSize = cc.size( // タイルマップのサイズを計算
            this.tiledMap.getTileSize().width * this.tiledMap.getMapSize().width, // タイルの幅 × x方向のタイルの枚数
            this.tiledMap.getTileSize().height * this.tiledMap.getMapSize().height); // タイルの高さ × y方向のタイルの枚数

        this.addPhisicsNode(); // コライダーを設置する
        this.addPrefab(); // プレハブを設置する
    }

    addPhisicsNode () { // 『Tiled』のオブジェクト情報を元にコライダーを配置
        let objects: any[] = this.tiledMap.getObjectGroup("platform").getObjects(); // 『Tiled』のplatformレイヤーのオブジェクトを取得
        let layerNode: cc.Node = this.tiledMap.node.getChildByName("platform"); // platformノードを取得
        let physicsNode: cc.Node = new cc.Node(); // コライダーを配置するノードを作成
        physicsNode.name = "platformCollider"; // ノード名を変更する
        let rigidBody: cc.RigidBody = physicsNode.addComponent(cc.RigidBody); // ノードにRigidBody（剛体）コンポーネントを追加
        rigidBody.type = cc.RigidBodyType.Static; // 剛体のタイプをスタティック（静的）にする
        for (let i = 0; i < objects.length; i ++) { // オブジェクトの数だけループ
            let curObject = objects[i]; // オブジェクトを取得
            let pos = cc.v2( // オブジェクトの位置をCocos Creatorの座標（中心が原点）に変換
                curObject.offset.x + curObject.width / 2 - this.tiledMapSize.width / 2, // マップの幅/2オフセット
                this.tiledMapSize.height / 2 - curObject.offset.y - curObject.height / 2); // マップの高さ/2オフセットし、正負逆転
            switch (curObject.type) { // タイプ別に処理をする
                case 0: // ボックス, ポイント
                    let boxCollider: cc.PhysicsBoxCollider = physicsNode.addComponent(cc.PhysicsBoxCollider); // 物理ノードにボックスコライダーを追加して取得
                    boxCollider.name = curObject.name; // 名前を取得   
                    boxCollider.density = 0; // 密度
                    boxCollider.friction = 0; // 摩擦係数
                    boxCollider.restitution = 0; // 反発係数
                    boxCollider.size = cc.size(curObject.width, curObject.height); // ボックスのサイズ
                    boxCollider.offset = pos; // ボックスの中心位置
                    break;
                case 1: // サークル
                    let circleCollider: cc.PhysicsCircleCollider = physicsNode.addComponent(cc.PhysicsCircleCollider); // 物理ノードにサークルコライダーを追加して取得
                    circleCollider.name = curObject.name; // 名前を取得
                    circleCollider.density = 0; // 密度
                    circleCollider.friction = 0; // 摩擦係数
                    circleCollider.restitution = 0; // 反発係数
                    circleCollider.radius = curObject.width / 2; // 円の半径
                    circleCollider.offset = pos; // 円の中心位置
                    break;
                case 2: // ポリゴン
                    let polygonCollider:cc.PhysicsPolygonCollider = physicsNode.addComponent(cc.PhysicsPolygonCollider); // 物理ノードにポリゴンコライダーを追加して取得
                    polygonCollider.name = curObject.name; // 名前を取得
                    polygonCollider.density = 0; // 密度
                    polygonCollider.friction = 0; // 摩擦係数
                    polygonCollider.restitution = 0; // 反発係数
                    for (let j = 0; j < curObject.points.length; j ++) { // ポリゴンの頂点の数だけループ
                        polygonCollider.points[j] = cc.v2(curObject.points[j]); // ポリゴンコライダーに頂点をコピー
                    }
                    if (curObject.points.length == 3) { // 三角形の場合
                        polygonCollider.points[curObject.points.length] = polygonCollider.points[0]; // 最後に始点を入れてポリゴンを閉じる
                    }
                    
                    polygonCollider.offset = pos; // ポリゴンの始点
                    break;
            }
        }
        layerNode.addChild(physicsNode); // 物理ノードをstaticノードの子ノードとして追加
    }

    @property(cc.Prefab) // Cocos Creatorのエディタに表示する
    coinGoldPrefab : cc.Prefab = null; // coinGoldのプレハブを取得する
    addPrefab () { // 『Tiled』のオブジェクト情報を元にプレハブを配置
        let objects = this.tiledMap.getObjectGroup("prefab").getObjects(); // 『Tiled』のオブジェクトを取得
        let layerNode = this.tiledMap.node.getChildByName("prefab"); // タイルマップの子ノードを取得
        let prefabArray: { [key: string]: cc.Prefab; } = {}; // 名前をkeyにしてプレハブを連想配列に収める
        prefabArray["coinGold"] = this.coinGoldPrefab; // コインのプレハブを配列に追加する

        for (let i = 0; i < objects.length; i ++) { // オブジェクトの数だけループ
            let curObject = objects[i]; // オブジェクトを取得
            switch (curObject.type) { // タイプ別に処理をする
                case 0: // ボックス, ポイント
                    let prefabNode = cc.instantiate(prefabArray[curObject.name]); // Prefabからノードを作成
                    prefabNode.scale /= this.node.scale; // ステージのスケールを相殺する
                    prefabNode.position = cc.v3( // ノードの位置を設定
                        curObject.offset.x + curObject.width / 2 - this.tiledMapSize.width / 2, // マップの幅/2オフセット
                        this.tiledMapSize.height / 2 - curObject.offset.y - curObject.height / 2, // マップの高さ/2オフセットし、正負逆転
                        0); // z座標は0
                        layerNode.addChild(prefabNode); // 子ノードとして追加
                    break;
            }
        }
    }

    setStage (url: string) {
        let self = this;
        cc.loader.loadRes(url, (err, res) => {
            self.tiledMap = self.node.addComponent(cc.TiledMap);
            self.tiledMap.tmxAsset = res;

            self.tiledMapSize = cc.size( // タイルマップのサイズを計算
                self.tiledMap.getTileSize().width * self.tiledMap.getMapSize().width, // タイルの幅 × x方向のタイルの枚数
                self.tiledMap.getTileSize().height * self.tiledMap.getMapSize().height); // タイルの高さ × y方向のタイルの枚数
    
            self.addPhisicsNode();
            self.addPrefab(); // プレハブを設置する
        });
    }

    // @property(cc.Prefab) 
    // coinGoldPrefab : cc.Prefab = null; 
    // @property(cc.Prefab) 
    // doorPrefab : cc.Prefab = null; 
    // @property(cc.Prefab) 
    // slimeBluePrefab : cc.Prefab = null; 
    // @property(cc.Prefab) 
    // brickBrown : cc.Prefab = null; 
    // @property(cc.Prefab) 
    // upBridge : cc.Prefab = null; 

    // addPrefab (tiledMap: cc.TiledMap) {
    //     let objects = tiledMap.getObjectGroup("items").getObjects(); // 『Tiled』のオブジェクトを取得
    //     let layerNode = tiledMap.node.getChildByName("items"); // タイルマップの子ノードを取得
    //     let prefabArray: { [key: string]: cc.Prefab; } = {};
    //     prefabArray["coin"] = this.coinGoldPrefab;
    //     prefabArray["door"] = this.doorPrefab;
    //     prefabArray["slime"] = this.slimeBluePrefab;
    //     prefabArray["brickBrown"] = this.brickBrown;
    //     prefabArray["upBridge"] = this.upBridge;

    //     for (let j = 0; j < objects.length; j++) { // オブジェクトの数だけループ
    //         let curObject = objects[j]; // オブジェクトを取得
    //         switch (curObject.type) { // タイプ別に処理をする
    //             case 0: // ボックス, ポイント
    //                 let prefabNode = cc.instantiate(prefabArray[curObject.name]); // Prefabからノードを作成
    //                 prefabNode.position = cc.v3( // ノードの位置を設定
    //                     curObject.offset.x + curObject.width / 2 - this.tiledMapSize.width / 2, // マップの幅/2オフセット
    //                     this.tiledMapSize.height / 2 - curObject.offset.y - curObject.height / 2, // マップの高さ/2オフセットし、正負逆転
    //                     0); 
    //                     layerNode.addChild(prefabNode); // 子ノードとして追加
    //                 break;
    //         }
    //     }
    // }

}
