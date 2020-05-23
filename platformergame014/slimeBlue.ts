const {ccclass, property} = cc._decorator;

@ccclass
export default class slimeBlue extends cc.Component { // クラス名をNewClassからslimeBlueにする

    scaleTotal: number = 0; // 適用されているスケール
    gravityScale: number = 6; // プレイヤーの重力スケール
    camera: cc.Node = null; // カメラのノード
    moveDistanceX: number = 0; // 動き始める距離
    player: any = null; // playerコンポーネント
    start () {
        this.node.getComponent(cc.RigidBody).gravityScale = this.gravityScale; // 重力スケールを設定する
        this.scaleTotal = this.node.scaleX * cc.find("Canvas/stage01").scaleX; // 適用されているスケール
        this.camera = cc.find("Canvas/Main Camera");
        this.moveDistanceX = cc.winSize.width / 2 * 1.2;
        this.player = cc.find("Canvas/player").getComponent("player"); // playerコンポーネントを取得する
    }

    direction: number = -1; // 移動方向
    inputDir: boolean = false; // 方向転換中かどうか、true=方向転換中
    onBeginContact (contact: cc.PhysicsContact,
        selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) { // 接触開始時の処理

        // 接点の場所を判定する
        let points = contact.getWorldManifold().points; // 接点のワールド座標を取得
        let relativePoint: cc.Vec2 = cc.Vec2.ZERO; // 変換後の座標 
        let isLeft: number = 1; // 左かどうか、1：左
        let isRight: number = 1; // 右かどうか、1：右
        for (let i = 0; i < points.length; i++) { // 接点の数だけループする
            selfCollider.body.getLocalPoint(points[i], relativePoint); // 接点をワールド座標から自身のローカル座標に変換する
            relativePoint.divSelf(this.scaleTotal); // 座標にスケールを反映する
            if (relativePoint.x >= -42) { // 左ではない場合
                isLeft = 0; // 左フラグを0にする
            }
            if (relativePoint.x <= 42) { // 右ではない場合
                isRight = 0; // 右フラグを0にする
            }
        }

        // 方向転換処理
        let newDirection: number = isLeft - isRight; // 新しい方向を計算、左が接触したら右（newDirection=1）に行く
        if (!this.inputDir && newDirection) { // 方向転換中でない、かつ方向が0ではない場合
            this.inputDir = true;
            
            let childNode: cc.Node = this.node.getChildByName("slimeBlue"); // 子ノードのslimeBlueを取得する
            childNode.scaleX = Math.abs(childNode.scaleX) * -1 * newDirection; // ノードの向きを変える、元の絵が左向き
            this.direction = newDirection; // 方向を更新する
        }
    }

    onEndContact (contact: cc.PhysicsContact,
        selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) { // 接触終了時の処理
        this.inputDir = false; // 方向転換中フラグをfalseにする
    }

    speed: number = 120; // 移動速度
    _paused: boolean = false; // 停止状態を保持する
    curVelocity: cc.Vec2 = cc.Vec2.ZERO; // 停止時に速度を保持する
    curGravityScale: number = 0; // 停止時に重力スケールを保持する
    set paused (value: boolean) { // _pausedのセッター
        if (this._paused == value) return; // 同じ値なら処理を抜ける
        this._paused = value; // 値を更新する
        let rigidBody: cc.RigidBody = this.node.getComponent(cc.RigidBody); // RigidBodyを取得する
        if(value){ // 停止中にする場合
            this.curVelocity = rigidBody.linearVelocity; // 現在の速度を保持する
            this.curGravityScale = rigidBody.gravityScale; // 現在の重力スケールを保持する
            rigidBody.linearVelocity = cc.Vec2.ZERO; // 速度をゼロにする
            rigidBody.gravityScale = 0; // 重力スケールをゼロにする
        } else { // 停止中を解除する場合
            rigidBody.linearVelocity = this.curVelocity; // 停止前の速度に戻す
            rigidBody.gravityScale = this.curGravityScale; // 停止前の重力スケールに戻す
        }
    }
    isHit: boolean = false;　// 倒されたかどうか、true=倒されている
    update (dt: number) { // 毎フレームの描画前の処理（dt：前フレームからの経過時間）
        if (this.isHit) return; // 倒されている場合、処理を抜ける

        // 画面外にいる場合、またはプレイヤーが停止中の場合、停止する
        let selfWorldPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO); // 自ノードのワールド座標
        let cameraWorldPos = this.camera.convertToWorldSpaceAR(cc.Vec2.ZERO); // カメラのワールド座標
        let distance: cc.Vec2 = selfWorldPos.sub(cameraWorldPos); // 自ノードとカメラの距離を取得
        if (Math.abs(distance.x) > this.moveDistanceX // 自ノードが画面外の場合
            || this.player.paused) { // または、プレイヤーが一時停止中の場合
            this.paused = true; // 一時停止する
            return; // 処理を抜ける
        } else { // それ以外の場合
            this.paused = false; // 一時停止を解除する
        }

        // 左右の移動
        let velocity: cc.Vec2 = this.node.getComponent(cc.RigidBody).linearVelocity; // 現在の速度を取得
        velocity.x = this.speed * this.direction; // 速度を計算する
        this.node.getComponent(cc.RigidBody).linearVelocity = velocity; // 速度を更新する
    }

    hit () { // 倒された時の処理
        this.isHit = true; // 倒されたフラグをtrueにする
        this.paused = true; // 停止中フラグをtrueにする
        this.node.getComponent(cc.Animation).play("slimeBlueHit"); // 『hit』用のアニメを再生する
    }

    destroyNode () {// キーフレームイベント：親ノードを破棄する
        this.node.destroy(); // 親ノードを破棄する
    }
}