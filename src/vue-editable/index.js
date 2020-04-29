import Vue from 'vue'
import template from './template.html' 
import './style.less'
const nameComponent = 'vue-editable'
const component = {
    props: ["getValue", "setValue", "itemLabel", "params", "empty", "styleLabel", "styleItem"],
    data: () => {
        return {show: true, temp: ''}
    },
    methods: {
        showEdit: function() {
            this.$nextTick(() => {
                this.temp = this.rawValue;
                this.$refs.input.focus()
            })
        },
        unFocus: function() {
            this.$refs.input.blur()
        }
    },
    computed: {
        viewValue: function() {
            let toRet = this.getValue(this.params);
            if (!("" + toRet).length) return this.empty ? this.empty : "[empty]";
            return toRet;
        },
        rawValue: function() {
            return this.getValue(this.params);
        }
    },
    template
}
Vue.component(nameComponent, component)
export const name = component
export default {
    nameComponent,
    component
}