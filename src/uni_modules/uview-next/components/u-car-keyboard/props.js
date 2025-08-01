export default {
    props: {
        // 是否打乱键盘按键的顺序
        random: {
            type: Boolean,
            default: ()=> uni.$u.props.carKeyboard.random
        },
        // 输入一个中文后，是否自动切换到英文
        autoChange: {
            type: Boolean,
            default: ()=> uni.$u.props.carKeyboard.autoChange
        }
    }
}
