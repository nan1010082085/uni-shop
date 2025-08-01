/*
 * @Author       : LQ
 * @Description  :
 * @version      : 1.0
 * @Date         : 2021-08-20 16:44:21
 * @LastAuthor   : LQ
 * @lastTime     : 2021-08-20 17:22:40
 * @FilePath     : /u-view2.0/uview-ui/libs/config/props/tabbar.js
 */

import theme from '../theme.js'

export default {
    // tabbar
    tabbar: {
        value: null,
        safeAreaInsetBottom: true,
        border: true,
        zIndex: 1,
        activeColor: theme.primary,
        inactiveColor: theme.lightColor,
        fixed: true,
        placeholder: true
    }
}
