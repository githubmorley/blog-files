const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component { // クラス名をNewClassからPlayerにする
    
    gravityScale: number = 6; // プレイヤーの重力スケール
    onLoad () { // ノードが最初にアクティブになった時の処理
        let physicsManager = cc.director.getPhysicsManager(); // 物理マネージャーを取得する
        physicsManager.enabled = true; // 物理マネージャーを有効にする
        physicsManager.debugDrawFlags = cc.PhysicsManager.DrawBits.e_shapeBit; // コライダーの形状を表示する

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this); // KeyDownイベントを登録
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this); // KeyUpイベントを登録
    
        this.getComponent(cc.RigidBody).gravityScale = this.gravityScale; // 重力スケールを設定する
    }

    onDestroy () { // ノードが破棄される時の処理
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this); // KeyDownイベントを登録
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this); // KeyUpイベントを登録
    }

    direction: number = 0; // プレイヤーの移動方向
    inputRight: number = 0; // 右移動の入力状態
    inputLeft: number = 0; // 左移動の入力状態
    inputJump: number = 0; // ジャンプの入力状態
    jumpSpeed: number = 900; // プレイヤーのジャンプ速度
    onKeyDown (event: cc.Event.EventKeyboard) {  // キーを押した時の処理
        switch(event.keyCode) { // 押されたキーの種類で分岐
            case cc.macro.KEY.d: // 『d』キーの場合
            case cc.macro.KEY.right: // 『→』キーの場合
                this.inputRight = 1; // 『右』の入力を1にする
                this.direction = this.inputRight - this.inputLeft; // プレイヤーの移動方向 右=1、左=-1
                break;
            case cc.macro.KEY.a: // 『a』キーの場合
            case cc.macro.KEY.left: //  『←』キーの場合
                this.inputLeft = 1; //『左』の入力を1にする
                this.direction = this.inputRight - this.inputLeft; // プレイヤーの移動方向 右=1、左=-1
                break;
            case cc.macro.KEY.w: // 『w』キーの場合
            case cc.macro.KEY.up: // 『↑』キーの場合
            case cc.macro.KEY.space: // 『スペース』キーの場合
                // ジャンプ処理
                if (!this.inputJump) { // 『ジャンプ』の入力が0の場合
                    this.inputJump = 1; //『ジャンプ』の入力を1にする
                    let velocity: cc.Vec2 = this.getComponent(cc.RigidBody).linearVelocity; // 現在の速度を取得
                    if (velocity.y == 0) { // y方向の速度が0の場合
                        velocity.y = this.jumpSpeed; // ジャンプする（y+方向にジャンプ速度を与える）
                    }
                    this.getComponent(cc.RigidBody).linearVelocity = velocity; // 速度を更新する
                }
                break;
        }
    }

    onKeyUp (event: cc.Event.EventKeyboard) { // キーを離した時の処理
        switch(event.keyCode) { // 押されたキーの種類で分岐
            case cc.macro.KEY.d: // 『d』キーの場合
            case cc.macro.KEY.right: // 『→』キーの場合
                this.inputRight = 0; // 『右』の入力を1にする
                this.direction = this.inputRight - this.inputLeft; // プレイヤーの移動方向 右=1、左=-1
                break;
            case cc.macro.KEY.a: // 『a』キーの場合
            case cc.macro.KEY.left: //  『←』キーの場合
                this.inputLeft = 0; //『左』の入力を0にする
                this.direction = this.inputRight - this.inputLeft; // プレイヤーの移動方向 右=1、左=-1
                break;
            case cc.macro.KEY.w: // 『w』キーの場合
            case cc.macro.KEY.up: // 『↑』キーの場合
            case cc.macro.KEY.space: // 『スペース』キーの場合
                this.inputJump = 0; //『ジャンプ』の入力を0にする
                break;
        }
    }

    landingArray: { [key: string]: boolean; } = {}; // 接触しているブロックのUUIDを保持する連想配列
    isLanging: boolean = true; // 着地中かどうか　true：着地中
    onBeginContact (contact: cc.PhysicsContact,
        selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) { // 接触開始時の処理

        // 接点の場所を判定する
        let points = contact.getWorldManifold().points; // 接点のワールド座標を取得
        let playerBody: cc.RigidBody = selfCollider.body; // プレイヤーのボディを取得
        let relativePoint: cc.Vec2 = cc.Vec2.ZERO; // 変換後の座標
        let isPlayerBottom: boolean = true; // プレイヤーの足元かどうか、true：足元
        for (let i = 0; i < points.length; i++) { // 接点の数だけループする
            playerBody.getLocalPoint(points[i], relativePoint); // 接点をワールド座標からプレイヤーのローカル座標に変換する
            relativePoint.divSelf(this.node.scaleY); // プレイヤーノードのスケールを反映
            if (relativePoint.y >= -60.5) { // 足元ではない場合
                isPlayerBottom = false; // falseにする
            }
        }

        // 足元に接触したブロックのUUIDを配列に追加する
        if (otherCollider.tag == 0) { // ブロックのコライダー（tag=0）の場合
            if (isPlayerBottom) { // 足元の場合
                this.landingArray[otherCollider.uuid] = true; // UUIDを配列に追加する
                this.isLanging = true; // 着地中にする
                // this.jumpCount = 0;
            }
        }
   
    }

    onEndContact (contact: cc.PhysicsContact,
        selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) { // 接触終了時の処理

        // 接触終了したブロックのUUIDを配列から削除する
        delete this.landingArray[otherCollider.uuid]; // 配列にUUIDがあれば削除する
        if (Object.keys(this.landingArray).length == 0) { // 接触しているブロックの数が０の場合
            this.isLanging = false; // 着地していない
        }
    }

    acceleration: number = 2000; // プレイヤーの加速度
    maxSpeed: number = 400; // プレイヤーの最大速度
    update (dt: number) { // 毎フレームの描画前の処理（dt：前フレームからの経過時間）
        let velocity: cc.Vec2 = this.getComponent(cc.RigidBody).linearVelocity; // 現在の速度を取得

        // 左右の移動処理
        if(this.direction != 0) { // 移動する場合
            this.node.scaleX = Math.abs(this.node.scaleX) * this.direction; // 絵の向きを進行方向にする
            velocity.x += this.acceleration * dt * this.direction; // 次の速度を計算する
            if(velocity.x < -this.maxSpeed) velocity.x = -this.maxSpeed; // 最大速度に制限する（左移動）
            else if(velocity.x > this.maxSpeed) velocity.x = this.maxSpeed; // 最大速度に制限する（右移動）
        } else { // 停止する場合
            if (velocity.x != 0) { // 速度が0でない場合
                let d: number = this.acceleration * dt; // 1フレーム当たりの減速量
                if (velocity.x < -d) velocity.x += d; // 減速処理（左移動）
                else if (velocity.x > d) velocity.x -= d; // 減速処理（右移動）
                else velocity.x = 0; // 速度が減速量以下の場合は停止する
            }
        }

        this.getComponent(cc.RigidBody).linearVelocity = velocity; // 速度を更新する
    }
    
}