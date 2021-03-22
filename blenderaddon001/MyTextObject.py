# bl_info（アドオンに関する情報）の設定
bl_info = {
    "name": "テキストオブジェクト作成", # アドオンの名前
    "author": "モーリー", # アドオンの作者
    "version": (0, 1), # アドオンのバージョン(メジャーバージョン（リリース前は0）, マイナーバージョン)
    "blender": (2, 92, 0), # 動作可能なBlenderバージョン
    "location": "3Dビューポート > サイドバー", # アドオンの機能を使うためのUIが存在する場所
    "description": "アドオンのテンプレート", # 説明文
    "warning": "", # 使用時の注意点、バグ情報等
    "support": "TESTING", # サポートレベル、'OFFICIAL':公式, 'COMMUNITY':コミュニティ', 'TESTING':テスト中'
    "wiki_url": "", # アドオンに関するドキュメントを公開しているURL
    "tracker_url": "", # ユーザが開発者へ不具合の報告をするためのWebページのURL
    "category": "Object" # プリファレンスのアドオンのカテゴリ検索の分類
} 

import bpy # アドオン開発者用のAPI
from bpy.props import ( # プロパティクラス
    # BoolProperty, # ブーリアン、UIではチェックボックス
    # BoolVectorProperty, # ブーリアン（グループ）
    # CollectionProperty, # コレクション
    EnumProperty, # 列挙型、UIでセレクトボックス
    # FloatProperty, # 浮動小数点
    # FloatVectorProperty, # 浮動小数点（グループ）
    # IntProperty, # 整数
    # IntVectorProperty, # 整数（グループ） 
    # PointerProperty, # ポインタ
    StringProperty, # 文字列、UIではテキストボックス
)

# クラスの命名規則
# [A-Z][A-Z0-9_]*_(HT|MT|OT|PT|UL)_[A-Za-z0-9_]+
# 継承するクラスによって識別子を変更
# HT : bpy.types.Header
# MT : bpy.types.MENU
# OT : bpy.types.Operator
# PT : bpy.types.Panel
# UL : bpy.types.UIList

# パネルクラス：サイドバーのタブを構成
class SIDEBAR_PT_CustomMenu(bpy.types.Panel):
    bl_category = "テキスト作成" # タブに表示される文字列
    bl_label = "テキストオブジェクト作成" # タブを開いたメニューのヘッダーに表示される文字列
    bl_space_type = "VIEW_3D" # メニューを表示するエリア
    bl_region_type = "UI" # メニューを表示するリージョン

    # ヘッダーのカスタマイズ
    def draw_header(self, context):
        layout = self.layout # UIを定義するレイアウトクラスを取得
        layout.label(text="", icon="PLUGIN") # ヘッターのアイコンを設定

    # メニューの描画処理
    def draw(self, context):
        layout = self.layout # UIを定義するレイアウトクラスを取得
        scene = context.scene # シーンデータブロックを取得

        layout.label(text="フォントを選択：") # ラベルを追加
        layout.prop(scene, "enum_fontfile") # テキストボックスを追加
        
        layout.prop(scene, "string_fontfile1") # テキストボックスを追加
        layout.prop(scene, "string_fontfile2") # テキストボックスを追加
        layout.prop(scene, "string_fontfile3") # テキストボックスを追加

        layout.label(text="文字列：") # ラベルを追加
        layout.prop(scene, "string_text") # テキストボックスを追加

        layout.operator(BUTTON_OT_CreateText.bl_idname) # ボタンを追加

# オペレータクラス：テキストオブジェクトを作成
class BUTTON_OT_CreateText(bpy.types.Operator):
    bl_idname = "button.createtext" # Blender内部で使用するID
    # bl_idnameの命名規則
    # [A-Z][A-Z0-9_]*_(HT|MT|OT|PT|UL)_[A-Za-z0-9_]+
    # 『.(ピリオド)』を1つだけ含む、全て小文字と数字と『_(ピリオド)』

    bl_label = "作成" # ボタンに表示する文字列
    bl_description = "テキストオブジェクトを作成します。" # 説明文、マウスオーバーで表示

    def execute(self, context): # ボタンを押された時の処理
        bpy.ops.object.text_add() # テキストオブジェクトを追加
        bpy.context.object.data.body = context.scene.string_text # 文字列を設定

        if context.scene.enum_fontfile == "1": # 1を選択した場合
            bpy.context.object.data.font = bpy.data.fonts.load(context.scene.string_fontfile1) # 1のフォントを設定
        elif context.scene.enum_fontfile == "2": # 2を選択した場合
            bpy.context.object.data.font = bpy.data.fonts.load(context.scene.string_fontfile2) # 2のフォントを設定
        elif context.scene.enum_fontfile == "3": # 3を選択した場合
            bpy.context.object.data.font = bpy.data.fonts.load(context.scene.string_fontfile3) # 3のフォントを使用

        # オペレータメッセージを出力
        self.report({"OPERATOR"}, "ボタンが押されました。")
        # {'INFO'}     : 情報として表示, ハイライト表示（青色）
        # {'WARNING'}  : 警告として表示, ハイライト表示（橙色）
        # {'ERROR'}    : エラーとして表示, ハイライト表示（赤色）
        # {'OPERATOR'} : オペレータメッセージとして表示

        return {"FINISHED"} # execute メソッドの処理を確定

# プロパティを追加
def add_props():
    scene = bpy.types.Scene # シーンデータブロック 
    scene.enum_fontfile = EnumProperty( # フォントファイルを選択
        name="", # 名前
        description="使用するフォントを選択します。", # 説明文、マウスオーバーで表示
        default="1", # デフォルト値
        items=[ # EnumPropertyで表示する項目リスト
            ("1", "1を選択", "1のフォントを選択します。"), # 識別子（選択時に変数に設定される値）, 項目名, 説明
            ("2", "2を選択", "2のフォントを選択します。"), 
            ("3", "3を選択", "3のフォントを選択します。"),
        ]
    )
    scene.string_fontfile1 = StringProperty( # フォントファイルのパス
        name="1", # 
        description="フォントファイルを指定します。", # 説明文、マウスオーバーで表示
        default="C:\Windows\Fonts\meiryob.ttc", # 初期値、メイリオ
        subtype="FILE_PATH", # 入力形式を指定
    )
    scene.string_fontfile2 = StringProperty( # フォントファイルのパス
        name="2", # 
        description="フォントファイルを指定します。", # 説明文、マウスオーバーで表示
        default="C:\Windows\Fonts\msgothic.ttc", # 初期値、MSゴシック
        subtype="FILE_PATH", # 入力形式を指定
    )
    scene.string_fontfile3 = StringProperty( # フォントファイルのパス
        name="3", # 
        description="フォントファイルを指定します。", # 説明文、マウスオーバーで表示
        default="C:\Windows\Fonts\msmincho.ttc", # 初期値、MS明朝
        subtype="FILE_PATH", # 入力形式を指定
    )
    scene.string_text = StringProperty( # テキストオブジェクトにする文字列
        name="",
        description="テキストオブジェクトにする文字列を入力します。", # 説明文、マウスオーバーで表示
        default="テキストを入力", # 初期値
        subtype="NONE", # 入力形式を指定
    )

# プロパティを削除 
def del_props():
    scene = bpy.types.Scene # シーンデータブロックを取得
    del scene.string_text # テキストオブジェクトにする文字列
    del scene.string_fontfile1 # フォントファイルのパス
    del scene.string_fontfile2 # フォントファイルのパス
    del scene.string_fontfile3 # フォントファイルのパス
    del scene.enum_fontfile # フォントファイルを選択

# Blenderに登録するクラスをclassesにまとめる
classes = [
    SIDEBAR_PT_CustomMenu, # サイドバーのタブを構成するクラス
    BUTTON_OT_CreateText, # テキストオブジェクトを作成するクラス
]

# アドオン有効化時の処理
def register():
    for c in classes: # classesの要素の数だけループする
        bpy.utils.register_class(c) # オペレータクラスを登録する
    add_props() # プロパティを追加

# アドオン無効化時の処理
def unregister():
    del_props() # プロパティを削除
    for c in classes: # classesの要素の数だけループする
        bpy.utils.unregister_class(c) # オペレータクラスを登録解除する

# メイン処理
# [テキスト] > [スクリプト実行] を実行したときに呼ばれる処理
# アドオンでは不要だが慣習として書くことが多い
if __name__ == "__main__":
    register() # アドオン有効化時の処理