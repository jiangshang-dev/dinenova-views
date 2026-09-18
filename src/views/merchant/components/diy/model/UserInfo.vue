<template>
  <div @click.stop="onEditer(index)">
    <div
      class="drag optional"
      :style="{
        background: item.style.bgcolor,
        paddingLeft: item.style.paddingLeft + 'px',
        paddingRight: item.style.paddingLeft + 'px',
        paddingTop: item.style.paddingTop + 'px',
        paddingBottom: item.style.paddingTop + 'px',
        marginLeft: item.style.marginLeft + 'px',
        marginRight: item.style.marginLeft + 'px',
        marginTop: item.style.marginTop + 'px',
        marginBottom: item.style.marginBottom + 'px',
        borderTopLeftRadius: item.style.topRadio + 'px',
        borderTopRightRadius: item.style.topRadio + 'px',
        borderBottomLeftRadius: item.style.bottomRadio + 'px',
        borderBottomRightRadius: item.style.bottomRadio + 'px',
        borderColor: item.style.borderColor,
      }"
    >
      <div class="diy-user-wrap">
        <div class="no-login-wrap" v-if="item.style.isLogin == 0">
          <div class="avatar">
            <img
              src="@/assets/img/default-avatar.png"
              class="img"
              :style="{
                width: `${item.style.loginBeforeAvatarSize}px`,
                height: `${item.style.loginBeforeAvatarSize}px`
              }"
            />
          </div>
          <div class="info">
            <div
              class="name"
              :style="{
                color: item.style.loginBeforeTxtColor,
              }"
            >
              Hi，你好！
            </div>
            <div
              class="txt"
              :style="{
                color: item.style.loginBeforeSubTxtColor,
              }"
            >
              为了向您提供更好的服务，请登录！
            </div>
          </div>
          <div
            class="btn"
            :style="{
              color: item.style.loginBtnTxtColor,
              background: item.style.loginBtnBg,
              borderRadius: item.style.loginBtnRadius + 'px',
            }"
          >
            登录
          </div>
        </div>
        <div class="login-wrap" v-else>
          <div class="avatar">
            <img
              src="@/assets/img/default-avatar.png"
              class="img"
              :style="{
                width: `${item.style.loginAfterAvatarSize}px`,
                height: `${item.style.loginAfterAvatarSize}px`,
                borderRadius: item.style.loginAvatarRadius + 'px',
              }"
            />
          </div>
          <div class="info">
            <div
              class="name"
              :style="{
                color: item.style.loginAfterTxtColor,
              }"
            >
              Hi，你好！
            </div>
            <div
              class="txt"
              :style="{
                color: item.style.loginAfterSubTxtColor,
              }"
            >
              余额：999
            </div>
            <div
              class="txt"
              :style="{
                color: item.style.loginAfterSubTxtColor,
              }"
            >
              积分：999
            </div>
          </div>
          <div class="code">
            <img
              src="@/assets/img/default-code.png"
              class="qrImg"
              :style="{
                width: `${item.style.loginQrSize}px`,
                height: `${item.style.loginQrSize}px`,
                borderRadius: item.style.loginAvatarRadius + 'px',
              }"
            />
          </div>
        </div>
      </div>
      <div class="btn-edit-del">
        <div class="btn-del" @click.stop="onDeleleItem(index)">删除</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ["item", "index", "selectedIndex"],
  methods: {
    onEditer(index) {
      this.$emit("onEditer", index);
    },
    onDeleleItem(index) {
      this.$emit("onDeleleItem", index);
    },
  },
};
</script>

<style lang="scss" scoped>
/* 登录状态 */
.drag.optional {
  overflow: hidden;
  border: 1px solid transparent;
}

.diy-user-wrap {
  .no-login-wrap {
    display: flex;
    align-items: center;
    height: 100%;
    .info {
      flex: 1;
      margin-left: 10px;
      .name {
        color: #333;
        font-size: 16px;
        margin-bottom: 5px;
      }
      .txt {
        color: #777;
      }
    }
    .btn {
      background: #fff;
      padding: 5px 15px;
      border-radius: 15px;
      color: #ffcc00;
    }
  }
  .login-wrap {
    display: flex;
    align-items: center;
    .img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }
    .qrImg {
      width: 30px;
      height: 30px;
    }
    .info {
      flex: 1;
      margin-left: 10px;
      .name {
        font-size: 16px;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
