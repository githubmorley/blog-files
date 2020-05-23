// 独自の型を宣言する
type PlayData = { // プレイ中のデータ（次のステージに引き継ぐデータ）
    score: number; // スコア
    life: number; // 残りのライフ
    stageNo: number; // ステージ番号
}

// 列挙型を定義する
const enum Score { // スコアの定義
    CoinGold = 100, // coinGoldを取得した時の点数
    SlimeBlue = 200 // slimeBlueを倒した時の点数
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component { // クラス名をNewClassからPlayerにする
    gravityScale: number = 6; // プレイヤーの重力スケール
    onLoad () { // ノードが最初にアクティブになった時の処理
        let physicsManager = cc.director.getPhysicsManager(); // 物理マネージャーを取得する
        physicsManager.enabled = true; // 物理マネージャーを有効にする
        // physicsManager.debugDrawFlags = cc.PhysicsManager.DrawBits.e_shapeBit; // コライダーの形状を表示する

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this); // KeyDownイベントを登録
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this); // KeyUpイベントを登録

        this.getComponent(cc.RigidBody).gravityScale = this.gravityScale; // 重力スケールを設定する

        this.backboard.opacity = 255; // ステージ開始前の画面を表示する
        this.paused = true; // 一時停止中にする
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
    jumpCount: number = 0; // ジャンプ回数カウント用変数
    JumpCountMax: number = 2; // 最大ジャンプ回数、2：二段ジャンプ
    inputCancel: boolean = false; // 入力をキャンセルする
    onKeyDown (event: cc.Event.EventKeyboard) {  // キーを押した時の処理
        if (this.inputCancel) { // キー入力をキャンセル中の場合
            this.inputRight = 0; // 入力を0にする
            this.inputLeft = 0; // 入力を0にする
            this.inputJump = 0; // 入力を0にする
            this.direction = 0; // 入力を0にする
            return; // キー入力キャンセル中の場合、処理を抜ける
        }

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
                    if (this.isLanging // 着地している場合
                        || (0 < this.jumpCount && this.jumpCount < this.JumpCountMax)) { // またはジャンプ回数が1～maxの場合
                        velocity.y = this.jumpSpeed; // ジャンプする（y+方向にジャンプ速度を与える）
                        this.jumpCount ++; // ジャンプ回数を加算する
                        this.jumpBreak = false; // ジャンプ中断フラグをfalseにする
                    }
                    this.getComponent(cc.RigidBody).linearVelocity = velocity; // 速度を更新する
                }
                break;
        }
    }

    jumpBreak: boolean = false; // ジャンプ中断フラグ、true：中断する
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
                this.jumpBreak = true; // ジャンプ中断フラグをtrueにする
                break;
        }
    }

    landingArray: { [key: string]: boolean; } = {}; // 接触しているブロックのUUIDを保持する連想配列
    isLanging: boolean = true; // 着地中フラグ、true：着地中
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
                isPlayerBottom = false; // 足元フラグをfalseにする
            }
        }

        // 足元に接触したブロックのUUIDを配列に追加する
        if (otherCollider.tag == 0) { // ブロックのコライダー（tag=0）の場合
            if (isPlayerBottom) { // 足元の場合
                this.landingArray[otherCollider.uuid] = true; // UUIDを配列に追加する
                this.isLanging = true; // 着地中フラグをtrueにする
                this.jumpCount = 0; // ジャンプ回数を0にする
            }
        }
        
        // 接触相手のノードごとの処理
        switch (otherCollider.node.name) { // 接触相手のノードの名前で処理を分岐する
            case "coinGold": // coinGoldの場合
                otherCollider.node.getComponent('coin').getCoin(); // coinスクリプトのgetCoin()を実行する
                this.score += Score.CoinGold; // スコアを取得する
                break;
            case "slimeBlue": // slimeBlueの場合
                if (isPlayerBottom) { // 足で踏んだ場合
                    otherCollider.node.getComponent('slimeBlue').hit(); // slimeBlueスクリプトのhit()を実行する
                    playerBody.linearVelocity = cc.v2(playerBody.linearVelocity.x, 500); // 踏んだ後に跳ねる
                    this.score += Score.SlimeBlue; // スコアを取得する
                }
                break; 
        }
    }

    onEndContact (contact: cc.PhysicsContact,
        selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) { // 接触終了時の処理

        // 接触終了したブロックのUUIDを配列から削除する
        delete this.landingArray[otherCollider.uuid]; // 配列にUUIDがあれば削除する
        if (Object.keys(this.landingArray).length == 0) { // 接触しているブロックの数が０の場合
            this.isLanging = false; // 着地中フラグをfalseにする
        }
    }

    acceleration: number = 2000; // プレイヤーの加速度
    maxSpeed: number = 400; // プレイヤーの最大速度
    jumpDeceleration: number = 6000; // ジャンプキーを離したときの減速度
    _animation: string = ""; // 再生中のアニメーションのクリップ名を保持する
    set animation (value: string) { // _animationのセッターメソッド
        if (this._animation != value) { // 再生中のアニメーションではない場合
            if (value == "") { // クリップ名がない場合
                this.node.getComponent(cc.Animation).stop(); // アニメーションを停止する
            } else { // クリップ名がある場合
                this.node.getComponent(cc.Animation).play(value); // アニメーションを再生する
            }
            this._animation = value; // 再生中のクリップ名を更新する
        }
    }
    _paused: boolean = false; // 停止状態を保持する
    curVelocity: cc.Vec2 = cc.Vec2.ZERO; // 停止時に速度を保持する
    curGravityScale: number = 0; // 停止時に重力スケールを保持する
    get paused (): boolean { // _pausedのゲッター
        return this._paused; // 値を返す
    }
    set paused (value: boolean) { // _pausedのセッター
        if (this._paused == value) return; // 同じ値なら処理を抜ける
        this._paused = value; // 値を更新する
        let rigidBody: cc.RigidBody = this.node.getComponent(cc.RigidBody); // RigidBodyを取得する
        if(value){ // 停止中にする場合
            this.curVelocity = rigidBody.linearVelocity; // 現在の速度を保持する
            this.curGravityScale = rigidBody.gravityScale; // 現在の重力スケールを保持する
            rigidBody.linearVelocity = cc.Vec2.ZERO; // 速度をゼロにする
            rigidBody.gravityScale = 0; // 重力スケールをゼロにする
            this.inputCancel = true; // キー入力をキャンセルする
        } else { // 停止を解除する場合
            rigidBody.linearVelocity = this.curVelocity; // 停止前の速度に戻す
            rigidBody.gravityScale = this.curGravityScale; // 停止前の重力スケールに戻す
            this.inputCancel = false; // キー入力を受け付ける
        }
    }
    update (dt: number) { // 毎フレームの描画前の処理（dt：前フレームからの経過時間）
        let velocity: cc.Vec2 = this.node.getComponent(cc.RigidBody).linearVelocity; // 現在の速度を取得

        // 左右の移動
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

        // ジャンプの中断
        if (this.jumpBreak) { // ジャンプ中断フラグがtrueの場合
            if (this.jumpCount && velocity.y > 0) { // ジャンプ中かつ上昇中の場合
                let d: number = this.jumpDeceleration * dt;; // 1フレーム当たりの減速量
                if (velocity.y > d) { // 上昇速度が減速量より大きい場合（マイナスにしない）
                    velocity.y -= d; // 減速する
                } else {
                    velocity.y = 0; // 速度を0にする
                }
            } else { // ジャンプ中かつ上昇中ではない場合
                this.jumpBreak = false; // ジャンプ中断フラグをfalseにする
            }
        }

        this.node.getComponent(cc.RigidBody).linearVelocity = velocity; // 速度を更新する

        // アニメーションの再生
        if (this.isLanging) { // 着地中の場合
            if (velocity.x == 0) { // X方向の速度が0の場合
                this.animation = "playerStand"; // 『stand』用のアニメを再生する
            } else { // X方向の速度が0ではない場合
                this.animation = "playerWalk"; // 『walk』用のアニメを再生する
            }
        } else { // 空中の場合
            this.animation = "playerJump"; // 『jump』用のアニメを再生する
        }
    }

    @property(cc.Label) // Cocos Creatorのエディタに表示する
    scoreLabel: cc.Label = null; // スコアのラベルを取得する
    @property(cc.Label) // Cocos Creatorのエディタに表示する
    stageNoLabel: cc.Label = null; // ステージ番号のラベルを取得する
    @property(cc.Label) // Cocos Creatorのエディタに表示する
    lifeLabel: cc.Label = null; // ライフのラベルを取得する
    
    @property(cc.Node) // Cocos Creatorのエディタに表示する
    backboard: cc.Node = null; // ステージ開始前の画面のバックボードを取得する
    @property(cc.Label) // Cocos Creatorのエディタに表示する
    bb_stageNoLabel: cc.Label = null; // ステージ開始前の画面のステージ番号のラベルを取得する
    playData: PlayData = { score: 0, stageNo:1, life: 3 } // プレイデータに初期値を設定する
    get score (): number { // スコアのゲッター
        return this.playData.score; // 値を返す
    }
    set score (value: number) { // スコアのセッター
        this.playData.score = value; // 値を取得する
        this.scoreLabel.string = "Score:" + ("000000" + value.toString()).slice(-7); // ラベルに表示する
    }
    get life (): number { // ライフのゲッター
        return this.playData.life; // 値を返す
    }
    set life (value: number) { // ライフのセッター
        this.playData.life = value; // 値を取得する
        this.lifeLabel.string = "Life:" + ("0" + value.toString()).slice(-2); // ラベルに表示する
    }
    get stageNo (): number { // ステージ番号のゲッター
        return this.playData.stageNo; // 値を返す
    }
    set stageNo (value: number) { // ステージ番号のセッター
        this.playData.stageNo = value; // 値を取得する
        this.stageNoLabel.string = "Stage:" + ("0" + value.toString()).slice(-2); // ラベルに表示する
        this.bb_stageNoLabel.string = this.stageNoLabel.string; // ステージ番号を表示する
    }
    start () { // ステージに初期値を設定する
        this.score = this.playData.score; // スコアを表示する
        this.stageNo = this.playData.stageNo; // ステージ番号を表示する
        this.life = this.playData.life; // ライフを表示する
        this.startTween(); // ステージ開始前の画面を非表示にする
    }

    startTween () { // ステージ開始前の画面を非表示にする
        cc.tween(this.backboard)
            .delay(1.0) // 1秒待つ
            .to(0.5, {opacity: 0}) // backboardを透明にする
            .call(() => {
                this.paused = false; // 一時停止を解除する
            })
            .start(); // このTweenを開始する
    }
}