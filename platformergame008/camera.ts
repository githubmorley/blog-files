const {ccclass, property} = cc._decorator;

@ccclass
export default class Camera extends cc.Component { // クラス名をNewClassからCameraにする

    @property(cc.Node) // Cocos Creatorのエディタに表示する
    player: cc.Node = null; // プレイヤーのノード
    @property(cc.Node) // Cocos Creatorのエディタに表示する
    stage: cc.Node = null; // ステージのノード

    offset: cc.Vec3 = null; // カメラの中心からプレイヤーをずらす距離
    boundLeft: number = 0; // カメラ座標の左端
    boundRight: number = 0; // カメラ座標の右端
    boundBottom: number = 0; // カメラ座標の下端
    boundTop: number = 0; // カメラ座標の上端

    start () { // 初めてupdate()が実行されるの前の処理
        this.offset = cc.v3(cc.winSize.width, 0, 0).div(10); // プレイヤーをカメラの中心から画面幅の1/10ずらす

        // カメラ座標の範囲（画角の左下隅にカメラの原点があると考える）
        this.boundLeft = 0; // 左端
        this.boundRight = this.stage.width * this.stage.scaleX - cc.winSize.width; // 右端（親ノード上でのステージの幅 - 画面の幅）
        this.boundBottom = 0; // 下端
        this.boundTop = this.stage.height * this.stage.scaleY - cc.winSize.height; // 上端（親ノード上でのステージの高さ - 画面の高さ）
    }

    lateUpdate () { // 全てのコンポーネントのupdate()の後の処理
        let cameraPos:cc.Vec3 = this.player.convertToWorldSpaceAR(cc.Vec3.ZERO); // プレイヤーのアンカーポイントのワールド座標を取得
        cameraPos.addSelf(this.offset); // カメラの位置をプレイヤーからずらす
        cameraPos = this.node.parent.convertToNodeSpaceAR(cameraPos); // // ワールド座標を親ノード（Canvas）の座標に変換する

        // カメラ座標を範囲内にする
        cameraPos.x = Math.max(cameraPos.x, this.boundLeft); // 座標が左端より小さいなら左端にする
        cameraPos.x = Math.min(cameraPos.x, this.boundRight); // 座標が右端より大きいなら右端にする
        cameraPos.y = Math.max(cameraPos.y, this.boundBottom); // 座標が下端より小さいなら左端にする
        cameraPos.y = Math.min(cameraPos.y, this.boundTop);// 座標が上端より大きいなら上端にする
        
        this.node.position = cameraPos; // カメラの位置を更新する
    }
}