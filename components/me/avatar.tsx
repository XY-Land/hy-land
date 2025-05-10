import UAvatar from "@nuxt/ui/components/Avatar.vue";
import { useChainAccount } from "~/composables/chainAccount";

export default defineComponent({
    name: "Avatar",
    async setup() {
        const { label, address } = useChainAccount();

        if (!address.value) {
            return () => <UAvatar icon="i-heroicons-user" />;
        }

        return () => (
            <UAvatar
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address.value}`}
                alt={label?.value ?? "wallet avatar"}
            />
        );

        // @TODO: 如果用户有 NFT 头像，则显示 NFT 头像
    },
});
