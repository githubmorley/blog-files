const {ccclass, property} = cc._decorator;

@ccclass
export default class Coin extends cc.Component { // クラス名をNewClassからCoinにする

    getCoin () { // プレイヤーがコインを取得した時の処理
        this.node.getComponent(cc.Animation).play("coinFadeout"); // coinFadeoutを再生する
    }

    destroyNode () {// キーフレームイベント：親ノードを破棄する
        this.node.parent.destroy(); // 親ノードを破棄する
    }
}