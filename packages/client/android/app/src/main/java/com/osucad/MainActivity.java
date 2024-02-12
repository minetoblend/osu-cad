package com.osucad;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.ActionMode;
import android.view.Window;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        Intent intent = getIntent();

        if (intent != null) {
            String action = intent.getAction();
            Uri data = intent.getData();

            if (action != null && action.equals(Intent.ACTION_VIEW) && data != null) {
                if (data.getScheme() != "https") {
                    intent.setData(
                            Uri.parse(
                                    data.toString().replace(
                                            data.getScheme() + "://",
                                            "https://"
                                    )
                            )
                    );
                }
            }
        }


        super.onCreate(savedInstanceState);

        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
    }
}
