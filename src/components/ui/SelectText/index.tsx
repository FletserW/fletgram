import { Text, TextProps, TouchableOpacity } from "react-native";
import { styles } from "./style";

type Props = TextProps & {
    text: string;
    onPress: () => void;
};

export function SelectText({ text, onPress, ...rest }: Props) {
    return (
        <TouchableOpacity onPress={onPress}>
            <Text style={styles.text} {...rest}>
                {text}
            </Text>
        </TouchableOpacity>
    );
}
