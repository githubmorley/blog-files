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

}
